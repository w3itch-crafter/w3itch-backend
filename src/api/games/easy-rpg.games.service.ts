import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import AdmZip from 'adm-zip-iconv';
import execa from 'execa';
import { Request, Response } from 'express';
import { cpSync, existsSync, rmSync, statSync } from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import process from 'process';

import { GameEngine } from '../../types/enum';
import { serveFileWithETag } from '../../utils/serveFileWithETag';

const rpgRtExtNames = ['lmt', 'ldb', 'ini'];

@Injectable()
export class EasyRpgGamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private readonly genCacheBin: string = join(
    process.cwd(),
    'thirdparty',
    'gencache',
    'bin',
    'gencache',
  );

  public static getThirdpartyDir(subdir: string): string {
    return join(process.cwd(), 'thirdparty', subdir);
  }

  private async execGenCache(
    path: string,
    reject = true,
  ): Promise<execa.ExecaChildProcess> {
    this.logger.log(`Exec gencache on ${path}`, this.constructor.name);
    const env = Object.assign({}, process.env);
    const options: execa.Options = { cwd: path, env, reject };
    // set the recursive argument to 6
    // https://github.com/EasyRPG/Player/issues/2771
    const exec = execa(this.genCacheBin, ['-r', '6', path], options);
    this.logger.log(`gencache -r 6 ${path}`, this.constructor.name);
    return exec;
  }

  public async getGames(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(
      process.cwd(),
      'thirdparty',
      decodeURIComponent(path),
    );
    try {
      statSync(filePath);
      await serveFileWithETag(req, res, filePath);
    } catch (error) {
      // if the file doesn't exist, fallback to the rtp directory
      if (error.code === 'ENOENT') {
        const filePath = join(
          process.cwd(),
          'thirdparty',
          // remove first two directory levels
          // eg. /games/yumenikki/Sound -> /rtp/Sound
          decodeURIComponent(path.replace(/\/?.+?\/.+?\//, '/rtp/')),
        );
        await serveFileWithETag(req, res, filePath);
      }
    }
  }

  public deleteGameDirectory(game: string) {
    const targetPath = join(
      EasyRpgGamesService.getThirdpartyDir('games'),
      game,
    );
    try {
      rmSync(targetPath, { recursive: true });
      this.logger.log(`Deleted ${targetPath}`, this.constructor.name);
    } catch (error) {
      // target directory doesn't exist, nothing to delete
    }
  }

  /**
   * Check if the game has all the required files
   * @param {AdmZip} zip game zip object
   * @returns {string} entryPath
   */
  public checkGameRpgRtFilesExist(zip: AdmZip): string {
    const rpgRtFlags = {
      lmt: false,
      ldb: false,
      ini: false,
    };
    let entryPath = '';
    const entries = zip.getEntries();
    const entryNames = [];
    entries.forEach((entry, index) => {
      const { entryName } = entry;
      rpgRtExtNames.forEach((extName) => {
        if (
          entryName.endsWith(`RPG_RT.${extName}`) &&
          !entryName.startsWith('__MACOSX/')
        ) {
          rpgRtFlags[extName] = true;
          this.logger.verbose(
            `Found RPG_RT.${extName} in ${entryName}`,
            this.constructor.name,
          );
          entryPath = entryName.substring(0, entryName.indexOf('RPG_RT.'));
        }
      });
      if (index % Math.floor(entries.length / 20) === 0) {
        entryNames.push(entryName);
      }
    });
    this.logger.verbose(
      `Files in zip: ${entries.length}`,
      this.constructor.name,
    );
    this.logger.verbose(
      'Some of the files in zip: ' + JSON.stringify(entryNames, null, 2),
      this.constructor.name,
    );

    const noEntryErrors = [];
    rpgRtExtNames.forEach((extName) => {
      if (!rpgRtFlags[extName]) {
        const error = `Entry not found in zip file: RPG_RT.${extName}`;
        noEntryErrors.push(error);
        this.logger.verbose(error, this.constructor.name);
      }
    });
    if (noEntryErrors.length > 0) {
      throw new BadRequestException(noEntryErrors);
    }
    return entryPath;
  }

  public async extractGame(
    zip: AdmZip,
    game: string,
    entryPath: string,
  ): Promise<void> {
    this.deleteGameDirectory(game);
    const tempPath = join(EasyRpgGamesService.getThirdpartyDir('temp'), game);
    const targetPath = join(
      EasyRpgGamesService.getThirdpartyDir('games'),
      game,
    );

    this.logger.debug(`Extract Game to ${tempPath}`, this.constructor.name);
    zip.extractAllTo(tempPath, true);
    const gamePath = join(tempPath, entryPath);
    this.logger.debug(
      `Move Game from ${gamePath} to ${targetPath}`,
      this.constructor.name,
    );
    cpSync(gamePath, targetPath, { recursive: true });

    if (!existsSync(join(targetPath, 'index.json'))) {
      // copy files from the rtp folder
      // use a filter to skip the exist files (don't overwrite)
      cpSync(EasyRpgGamesService.getThirdpartyDir('rtp'), gamePath, {
        recursive: true,
        filter: (_, dest) => {
          try {
            return !statSync(join(tempPath, dest));
          } catch (error) {
            return true;
          }
        },
      });
      // generate index.json in gamePath, move it to targetPath
      await this.execGenCache(gamePath);
      cpSync(join(gamePath, 'index.json'), join(targetPath, 'index.json'));
    } else {
      this.logger.debug(
        `index.json exists, skipping generateGameCache`,
        this.constructor.name,
      );
    }

    this.logger.log(`Delete ${tempPath}`, this.constructor.name);
    rmSync(tempPath, { recursive: true });
  }

  public uploadGame(
    game: string,
    engine: GameEngine,
    file: Express.Multer.File,
    charset?: string,
  ): Promise<void> {
    this.logger.verbose(`Using charset ${charset}`, this.constructor.name);
    const zip = new AdmZip(file.buffer, charset);
    const entryPath = this.checkGameRpgRtFilesExist(zip);
    return this.extractGame(zip, game, entryPath);
  }
}
