import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AdmZip from 'adm-zip-iconv';
import { spawn } from 'child_process';
import { promises as fsPromises } from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join, resolve } from 'path';
import PropertiesReader from 'properties-reader';

import { MinetestWorldPortItem } from '../../types';
import { GameEngine, GamesListSortBy, ReleaseStatus } from '../../types/enum';
import { GamesBaseService } from './games.base.service';
import { ISpecificGamesService } from './specific.games.service';

const worldFilesRequired = ['world.mt'];

@Injectable()
export class MinetestGamesService
  implements
    ISpecificGamesService,
    OnApplicationBootstrap,
    OnApplicationShutdown
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly gamesBaseService: GamesBaseService,
  ) {}

  private childProcesses = new Map<number, any>();
  private childProcessPromises = new Map<number, Promise<number>>();

  private childProcessCloseResolves = {};
  private childProcessCloseRejects = {};

  private worldPortMap = new Map<string, number>();
  private portOffset = 0;

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
    if (this.configService.get<boolean>('game.minetest.execMinetestEnabled')) {
      await this.execMinetest(this.getMinetestBin(), game, port);
    }
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
    await this.deleteGameResourceDirectory(gameWorld);

    const tempGameWorldPath = join(tempPath, entryPath);
    this.logger.debug(
      `Move Game world from ${tempGameWorldPath} to ${targetPath}`,
      this.constructor.name,
    );
    await this.handleWorldMtFile(tempGameWorldPath, {
      // gameid: 'minetest',
      world_name: gameWorld,
      backend: 'sqlite3',
      player_backend: 'sqlite3',
      readonly_backend: 'sqlite3',
      auth_backend: 'sqlite3',
    });
    await fsPromises.cp(tempGameWorldPath, targetPath, { recursive: true });

    this.logger.log(`Delete ${tempPath}`, this.constructor.name);
    await fsPromises.rm(tempPath, { recursive: true });
  }

  public async saveMinetestConfigForGameWorld(world: string): Promise<number> {
    // TODO find available port
    const gameIndex = this.portOffset;
    let port = this.worldPortMap.get(world);
    if (!port) {
      port =
        this.configService.get<number>('game.minetest.ports.begin', 30000) +
        gameIndex;
      this.portOffset += 1;
      this.worldPortMap.set(world, port);
    }
    const configFileName = `minetest.${port}.conf`;
    const configFilePath = this.getMinetestResourcePath(configFileName);
    this.logger.debug(
      `Save minetest config file ${configFilePath}`,
      this.constructor.name,
    );
    // create file if is not existed
    const file = await fsPromises.open(configFilePath, 'w+');
    await file.close();
    const properties = new PropertiesReader(configFilePath);
    properties.set('port', port);
    properties.set('remote_port', port);
    properties.set('name', 'w3itch');
    await properties.save(configFilePath);
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
      gameid?: string;
      world_name: string;
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

  public async deleteGameResourceDirectory(gameWorld: string) {
    await this.stopMinetestServerByGameWorldName(gameWorld);
    const targetPath = join(this.getMinetestResourcePath('worlds'), gameWorld);
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

  async getMinetestChildProcesses() {
    return this.childProcesses;
  }

  async execMinetest(
    path: string,
    worldName: string,
    port: number,
    reject = true,
  ): Promise<any> {
    this.logger.log(
      `Exec minetest on path: ${path} world: ${worldName} port: ${port}`,
      this.constructor.name,
    );

    await this.stopMinetestChildProcessByPort(port);

    const minetestConfigPath = this.getMinetestConfigPathByPort(port);
    //execa(
    const childProcess = spawn(this.getMinetestBin(), [
      '--server',
      // '--terminal',
      '--worldname',
      worldName,
      '--config',
      minetestConfigPath,
    ]);
    this.logger.log(
      `minetest --server --worldname ${worldName} --config ${minetestConfigPath}  process: ${childProcess.pid}`,
      this.constructor.name,
    );
    this.childProcesses.set(port, childProcess);
    const promise = new Promise<number>((resolve, reject) => {
      this.childProcessCloseResolves[port] = () => {
        this.logger.verbose(
          `Removing process & pormise in map, port ${port}`,
          this.constructor.name,
        );
        //recheck
        if (childProcess === this.childProcesses.get(port)) {
          this.childProcesses.delete(port);
        }
        if (promise === this.childProcessPromises.get(port)) {
          this.childProcessPromises.delete(port);
        }
        if (port === this.worldPortMap.get(worldName)) {
          this.worldPortMap.delete(worldName);
        }

        resolve(port);
      };

      this.childProcessCloseRejects[port] = reject;
    });
    this.childProcessPromises.set(port, promise);
    childProcess.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    childProcess.stderr.on('data', function (data) {
      console.error(data.toString());
    });
    childProcess.on('close', (code, signal) => {
      this.logger.log(
        `child process terminated due to receipt of signal ${signal}: code ${code}`,
        this.constructor.name,
      );

      if (this.childProcessCloseResolves[port]) {
        console.log(this.childProcessCloseResolves[port]);
        this.logger.verbose(
          'resolve child process promise',
          this.constructor.name,
        );
        this.childProcessCloseResolves[port](port);
      }
    });

    return childProcess;
  }

  private async stopMinetestChildProcessByPort(port: number) {
    const childProcessExisted = this.childProcesses.get(port);
    if (childProcessExisted) {
      this.logger.verbose(
        `Kill minetest server on port ${port}`,
        this.constructor.name,
      );
      const promise = this.childProcessPromises.get(port);

      childProcessExisted.kill('SIGINT');
      if (promise) {
        this.logger.log(
          `Waiting for child process to close, port ${port} `,
          this.constructor.name,
        );
        await promise;
      }
    }
  }

  getMinetestBin() {
    return this.configService.get('game.minetest.binPath');
  }
  getMinetestConfigPathByPort(port: number): string {
    return this.getMinetestResourcePath(`minetest.${port}.conf`);
  }

  getRunningGameWorldPorts(): MinetestWorldPortItem[] {
    const items = [];
    this.worldPortMap.forEach((value, key) => {
      items.push({
        gameWorldName: key,
        port: value,
      });
    });
    return items;
  }

  getPortByGameWorldName(gameWorldName: string): number {
    return this.worldPortMap.get(gameWorldName);
  }

  async restartMinetestServerByGameWorldName(
    gameWorldName: string,
  ): Promise<{ gameWorldName: string; port: number }> {
    let port = this.getPortByGameWorldName(gameWorldName);
    if (!port) {
      port = await this.saveMinetestConfigForGameWorld(gameWorldName);
    }
    await this.execMinetest(this.getMinetestBin(), gameWorldName, port);
    return {
      gameWorldName,
      port,
    };
  }

  async stopMinetestServerByGameWorldName(
    gameWorldName: string,
  ): Promise<MinetestWorldPortItem> {
    const port = this.getPortByGameWorldName(gameWorldName);

    await this.stopMinetestChildProcessByPort(port);

    return {
      gameWorldName,
      port,
    };
  }

  async listMintestWorlds(orderBy: string) {
    // More than this number can not rely on a single server, or at least a cluster or other distributed scheme.
    return (
      await this.gamesBaseService.paginateGameProjects(
        {
          // Avoid invalid URL errors.
          path: 'http://127.0.0.1/game-projects',
          limit: 1000,
          page: 1,
        },
        {
          kind: GameEngine.MINETEST,
          releaseStatus: ReleaseStatus.RELEASED,
          sortBy: GamesListSortBy.TIME,
          orderBy,
        },
      )
    ).data;
  }

  async onApplicationBootstrap() {
    this.logger.log(`Bootstrap application`, this.constructor.name);
    (await this.listMintestWorlds('ASC')).forEach(async (world) => {
      await this.restartMinetestServerByGameWorldName(world.gameName);
    });
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(
      `Shutting down application, signal: ${signal}`,
      this.constructor.name,
    );
    (await this.listMintestWorlds('DESC')).forEach(async (world) => {
      await this.stopMinetestServerByGameWorldName(world.gameName);
    });
  }
}
