import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AdmZip from 'adm-zip-iconv';
import execa from 'execa';
import { cpSync, rmSync } from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import PropertiesReader from 'properties-reader';

import { GameEngine } from '../../types/enum';
import { ISpecificGamesService } from './specific.games.service';
const worldFilesRequired = ['world.mt'];

@Injectable()
export class MinetestGamesService implements ISpecificGamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  private subProcesses = [];
  public async uploadGame(
    game: string,
    engine: GameEngine,
    file: Express.Multer.File,
    charset?: string,
  ): Promise<void> {
    this.logger.verbose(
      `Upload game world using charset ${charset}`,
      this.constructor.name,
    );
    const zip = new AdmZip(file.buffer, charset);
    const entryPath = this.checkGameWorldFilesExist(zip);
    await this.extractGameWorld(zip, game, entryPath);
    const port = await this.saveMinetestConfigForGameWorld(game);
    await this.execMinetest(this.getMinetestBin(), game, port);
  }

  public async extractGameWorld(
    zip: AdmZip,
    gameWorld: string,
    entryPath: string,
  ): Promise<void> {
    const tempPath = join(this.getMinetestResourcePath('temp'), gameWorld);
    const targetPath = join(this.getMinetestResourcePath('worlds'), gameWorld);

    this.logger.debug(
      `Extract Game world to ${tempPath}`,
      this.constructor.name,
    );
    zip.extractAllTo(tempPath, true);
    //clean up the target directory,current world will be overwritten
    this.deleteGameWorldDirectory(gameWorld);

    const tempGameWorldPath = join(tempPath, entryPath);
    this.logger.debug(
      `Move Game world from ${tempGameWorldPath} to ${targetPath}`,
      this.constructor.name,
    );
    await this.handleWorldMtFile(tempGameWorldPath, {
      gameid: 'minetest',
      backend: 'sqlite3',
      player_backend: 'sqlite3',
      readonly_backend: 'sqlite3',
      auth_backend: 'sqlite3',
    });
    cpSync(tempGameWorldPath, targetPath, { recursive: true });

    this.logger.log(`Delete ${tempPath}`, this.constructor.name);
    rmSync(tempPath, { recursive: true });
  }

  public async saveMinetestConfigForGameWorld(game: string): Promise<number> {
    // TODO find available port
    const gameIndex = 11;
    const port =
      this.configService.get<number>('game.minestart.ports.begin', 30000) +
      gameIndex;
    const configFileName = `minetest.${port}.conf`;
    return port;
  }
  /**
   *
   * @param tempGameWorldPath
   * @param options https://github.com/minetest/minetest/blob/master/doc/world_format.txt
   *
   * world.mt
   * ---------
   * World metadata.
   * Example content (added indentation and - explanations):
   * gameid = mesetint             - name of the game
   * enable_damage = true          - whether damage is enabled or not
   * creative_mode = false         - whether creative mode is enabled or not
   * backend = sqlite3             - which DB backend to use for blocks (sqlite3, dummy, leveldb, redis, postgresql)
   * player_backend = sqlite3      - which DB backend to use for player data
   * readonly_backend = sqlite3    - optionally readonly seed DB (DB file _must_ be located in "readonly" subfolder)
   * server_announce = false       - whether the server is publicly announced or not
   * load_mod_<mod> = false        - whether <mod> is to be loaded in this world
   * auth_backend = files          - which DB backend to use for authentication data
   * @see https://wiki.minetest.net/Worlds
   */
  async handleWorldMtFile(
    tempGameWorldPath: string,
    options: {
      gameid: string;
      backend: string;
      player_backend: string;
      readonly_backend: string;
      auth_backend: string;
    },
  ) {
    const worldMtPath = join(tempGameWorldPath, 'world.mt');
    this.logger.debug(`Handle ${worldMtPath}`, this.constructor.name);
    const properties = new PropertiesReader(worldMtPath, {
      writer: { saveSections: true },
    });
    Object.keys(options).forEach((key) => {
      properties.set(key, options[key]);
    });
    await properties.save(worldMtPath);
    return properties;
  }

  public getMinetestResourcePath(subPath: string): string {
    const minetestBasePath = this.configService.get<string>(
      'game.minetest.basePath',
    );
    return join(minetestBasePath, subPath);
  }

  public deleteGameWorldDirectory(gameWorld: string) {
    const targetPath = join(this.getMinetestResourcePath('games'), gameWorld);
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
  public checkGameWorldFilesExist(zip: AdmZip): string {
    let entryPath = '';
    const entries = zip.getEntries();
    const entryNames = [];
    const fileFlags = {};
    entries.forEach((entry, index) => {
      const { entryName } = entry;

      worldFilesRequired.forEach((worldFile) => {
        if (
          entryName.endsWith(`world.mt`) &&
          !entryName.startsWith('__MACOSX/')
        ) {
          this.logger.verbose(
            `Found ${worldFile} in ${entryName}`,
            this.constructor.name,
          );
          fileFlags[worldFile] = true;
          entryPath = entryName.substring(0, entryName.indexOf(worldFile));
        }
        entryNames.push(entryName);
      });
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
    worldFilesRequired.forEach((worldFile) => {
      if (!fileFlags[worldFile]) {
        const error = `Entry not found in zip file: ${worldFile}`;
        noEntryErrors.push(error);
        this.logger.verbose(error, this.constructor.name);
      }
    });
    if (noEntryErrors.length > 0) {
      throw new BadRequestException(noEntryErrors);
    }
    return entryPath;
  }

  async execMinetest(
    path: string,
    worldName: string,
    port: number,
    reject = true,
  ): Promise<execa.ExecaChildProcess> {
    this.logger.log(
      `Exec minetest on path: ${path} world: ${worldName} port: ${port}`,
      this.constructor.name,
    );
    const env = Object.assign({}, process.env);
    const options: execa.Options = { cwd: path, env, reject };
    const minetestConfigPath = this.getMinetestConfigPathByPort(port);
    const subprocess = execa(
      this.getMinetestBin(),
      [
        '--server',
        '--terminal',
        '--worldname',
        worldName,
        '--config',
        minetestConfigPath,
      ],
      options,
    );
    this.logger.log(
      `./minetest -server --terminal --worldname ${worldName} --config ${minetestConfigPath} : ${
        (await subprocess).escapedCommand
      }`,
      this.constructor.name,
    );
    this.subProcesses[port] = subprocess;
    return subprocess;
  }

  getMinetestBin() {
    return this.configService.get('game.minetest.binPath');
  }
  getMinetestConfigPathByPort(port: number): string {
    return this.getMinetestResourcePath(`minetest.${port}.conf`);
  }
}
