import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { Game } from '../../../entities/Game.entity';
import { UserJWTPayload } from '../../../types';
import { CreateGameProjectDto } from '../dto/create-game-proejct.dto';
import { ISpecificGamesService } from '../specific.games.service';
import { promises as fsPromises } from 'fs';
import AdmZip from 'adm-zip-iconv';
import { FilesystemService } from '../../../io/filesystem/filesystem.service';
import { ZipService } from '../../../io/zip/zip.service';

@Injectable()
export class HtmlGamesService implements ISpecificGamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly filesystemService: FilesystemService,
    private readonly zipService: ZipService,
  ) {}
  public getHtmlResourcePath(subdir: string): string {
    return join(process.cwd(), 'thirdparty', 'html', subdir);
  }
  public async uploadGame(
    user: Pick<UserJWTPayload, 'username' | 'id'>,
    file: Express.Multer.File,
    game: CreateGameProjectDto | Game,
  ): Promise<void> {
    const { charset } = game;
    const zip = new AdmZip(file.buffer, charset);
    const entryPath = this.checkIndexExist(zip);
    await this.extractGame(user, zip, game, entryPath);
  }
  async extractGame(
    user: Pick<UserJWTPayload, 'username' | 'id'>,
    zip: AdmZip,
    game: CreateGameProjectDto | Game,
    entryPath: string,
  ) {
    const { gameName } = game;
    const tempPath = join(this.getHtmlResourcePath('temp'), gameName);
    const targetPath = join(this.getHtmlResourcePath('games'), gameName);

    this.logger.debug(
      `Extract Game world to ${tempPath}`,
      this.constructor.name,
    );
    this.zipService.extractAllTo(zip, tempPath, true);
    //cleanup the target directory
    await this.deleteGameResourceDirectory(gameName);

    // tempPath + entryPath
    const tempEntryPath = join(tempPath, entryPath);
    this.logger.debug(
      `Move Game from ${tempEntryPath} to ${targetPath}`,
      this.constructor.name,
    );
    await this.filesystemService.copyDirectory(tempEntryPath, targetPath);

    this.logger.log(`Delete ${tempPath}`, this.constructor.name);
    await this.filesystemService.deleteDirectory(tempPath);
  }

  checkIndexExist(zip: AdmZip) {
    const entries = zip.getEntries();
    let entryPath: string;
    let isIndexExisted = false;
    entries.forEach((entry) => {
      const { entryName } = entry;
      if (entryName.endsWith('index.html')) {
        this.logger.verbose(`Found index.html in ${entryName}`);
        entryPath = entryName.substring(0, entryName.indexOf('index.html'));
        isIndexExisted = true;
      }
    });
    if (!isIndexExisted) {
      throw new BadRequestException(`Entry not found in zip file: index.html`);
    }
    return entryPath;
  }

  public async deleteGameResourceDirectory(gameName: string) {
    const targetPath = join(this.getHtmlResourcePath('games'), gameName);
    try {
      await fsPromises.rm(targetPath, { recursive: true });
      this.logger.log(`Deleted ${targetPath}`, this.constructor.name);
    } catch (error) {
      // target directory doesn't exist, nothing to delete
      this.logger.warn(
        'Try to delete an directory which is not existed',
        this.constructor.name,
      );
    }
  }
}
