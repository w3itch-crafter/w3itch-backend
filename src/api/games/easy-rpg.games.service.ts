import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import AdmZip from 'adm-zip-iconv';
import execa from 'execa';
import { Request, Response } from 'express';
import findRemoveSync from 'find-remove';
import { cpSync, existsSync, rmSync } from 'fs';
import { readdir } from 'fs/promises';
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

  private readonly gamesDir: string = join(
    process.cwd(),
    'thirdparty',
    'games',
  );

  private async execGenCache(
    path: string,
    reject = true,
  ): Promise<execa.ExecaChildProcess> {
    const env = Object.assign({}, process.env);
    const options: execa.Options = { cwd: path, env, reject };
    // set the recursive argument to 6
    // https://github.com/EasyRPG/Player/issues/2771
    const exec = execa(this.genCacheBin, ['-r', '6'], options);
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
    await serveFileWithETag(req, res, filePath);
  }

  public async generateGameCache(path: string): Promise<void> {
    this.logger.log(`Exec gencache on ${path}`, this.constructor.name);
    await this.execGenCache(path);
  }

  public async generateAllGameCaches(): Promise<void> {
    const files = await readdir(this.gamesDir, { withFileTypes: true });
    const dirs = files
      .filter((dirent) => dirent.isDirectory())
      .map((dir) => join(this.gamesDir, dir.name));
    for (const dir of dirs) {
      this.generateGameCache(dir);
    }
  }

  public deleteGameDirectory(game: string) {
    const cwd = process.cwd();
    const targetPath = `${cwd}/thirdparty/games/${game}`;
    this.logger.log(`Delete ${targetPath}`, this.constructor.name);
    findRemoveSync(targetPath, { dir: '*', files: '*.*' });
  }

  public uploadGame(
    game: string,
    engine: GameEngine,
    file: Express.Multer.File,
    charset?: string,
  ) {
    this.logger.verbose(`Using charset ${charset}`, this.constructor.name);
    const zip = new AdmZip(file.buffer, charset);
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
    const cwd = process.cwd();
    const tempPath = join(cwd, 'thirdparty', 'temp', game);
    const targetPath = join(cwd, 'thirdparty', 'games', game);
    this.logger.debug(`Delete ${targetPath}`, this.constructor.name);
    findRemoveSync(targetPath, { dir: '*', files: '*.*' });
    if (entryPath) {
      this.logger.debug(`Extract Game to ${tempPath}`, this.constructor.name);
      zip.extractAllTo(tempPath, true);
      const gamePath = join(tempPath, entryPath);
      this.logger.debug(
        `Move Game from ${gamePath} to ${targetPath}`,
        this.constructor.name,
      );
      cpSync(gamePath, targetPath, { recursive: true });
      rmSync(tempPath, { recursive: true });
    } else {
      this.logger.debug(`Extract Game to ${targetPath}`, this.constructor.name);
      zip.extractAllTo(targetPath, true);
    }
    if (existsSync(join(targetPath, 'index.json'))) {
      this.logger.debug(
        `index.json exists, skipping generateGameCache`,
        this.constructor.name,
      );
      return;
    }
    this.generateGameCache(targetPath);
  }
}
