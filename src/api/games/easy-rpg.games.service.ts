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
import { cpSync, createReadStream, rmSync } from 'fs';
import { readdir } from 'fs/promises';
import { lookup } from 'mime-types';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import process from 'process';

import { GameEngine } from '../../types/enum';

const rpgRtExtNames = ['lmt', 'ldb', 'ini', 'exe'];

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
  ): Promise<execa.ExecaChildProcess<string>> {
    const env = Object.assign({}, process.env);
    const options: execa.Options = { cwd: path, env, reject };
    const exec = execa(this.genCacheBin, options);
    this.logger.log(`gencache: ${path}`, this.constructor.name);
    return exec;
  }

  public async getGames(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(
      process.cwd(),
      'thirdparty',
      decodeURIComponent(path),
    );
    const file = createReadStream(filePath);
    file
      .on('open', () => {
        const contentType = lookup(filePath) || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        file.pipe(res);
      })
      .on('error', () => {
        file.close();
        file.pipe(res.sendStatus(404));
      });
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
    this.logger.verbose(`Use charset ${charset}`, this.constructor.name);
    const zip = new AdmZip(file.buffer, charset);
    const rpgRtFlags = {
      lmt: false,
      ldb: false,
      ini: false,
      exe: false,
    };
    let entryPath = '';
    zip.getEntries().forEach((entry, index, arr) => {
      this.logger.verbose(entry.entryName, this.constructor.name);
      rpgRtExtNames.forEach((extName) => {
        const { entryName } = entry;
        if (
          entryName.endsWith(`RPG_RT.${extName}`) &&
          !entryName.startsWith('__MACOSX/')
        ) {
          rpgRtFlags[extName] = true;
          entryPath = entryName.substring(0, entryName.indexOf('RPG_RT.'));
        }
      });
    });

    rpgRtExtNames.forEach((extName) => {
      if (!rpgRtFlags[extName]) {
        throw new BadRequestException(
          `Entry not found in zip file: RPG_RT.${extName}`,
        );
      }
    });
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
    this.generateGameCache(targetPath);
  }
}
