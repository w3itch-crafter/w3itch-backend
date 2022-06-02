import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AdmZip from 'adm-zip-iconv';
import { spawn } from 'child_process';
import { isEmpty, isNotEmpty } from 'class-validator';
import { promises as fsPromises } from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import PropertiesReader from 'properties-reader';

import { Game } from '../../entities/Game.entity';
import { MinetestWorldPortItem, UserJWTPayload } from '../../types';
import { CreateGameProjectDto } from './dto/create-game-proejct.dto';
import { GamesBaseService } from './games.base.service';
import { MinetestWorldsService } from './minetest-worlds/minetest-worlds.service';
import { ISpecificGamesService } from './specific.games.service';

const worldFilesRequired = ['world.mt'];

const ADMIN_USERNAME = '__ADMIN__';
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
    private readonly minetestWorldService: MinetestWorldsService,
  ) {}

  private childProcesses = new Map<number, any>();
  private childProcessPromises = new Map<number, Promise<number>>();

  private childProcessCloseResolves = {};
  private childProcessCloseRejects = {};

  public async uploadGame(
    user: UserJWTPayload,
    file: Express.Multer.File,
    game: Game | CreateGameProjectDto,
  ): Promise<void> {
    const { charset } = game;
    this.logger.verbose(
      `Upload game world using charset ${charset}`,
      this.constructor.name,
    );
    const zip = new AdmZip(file.buffer, charset);
    const entryPath = this.checkGameWorldFilesExist(zip);
    await this.extractGameWorld(user, zip, game.gameName, entryPath);
    const port = await this.saveMinetestConfigForGameWorld(
      user.username,
      game.gameName,
    );
    if (this.configService.get<boolean>('game.minetest.execMinetestEnabled')) {
      await this.execMinetest(this.getMinetestBin(), game.gameName, port);
    }
  }

  public async extractGameWorld(
    user: UserJWTPayload,
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
      name: user.username,
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

  public async saveMinetestConfigForGameWorld(
    worldAmdinUsername: string,
    world: string,
  ): Promise<number> {
    let port = await this.getPortByGameWorldName(world);
    if (!port) {
      const minetestWorld = await this.minetestWorldService.save({
        gameWorldName: world,
      });
      port = minetestWorld.port =
        this.configService.get<number>('game.minetest.ports.begin', 30000) +
        minetestWorld.id;
      await this.minetestWorldService.save(minetestWorld);
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
    const templateConfigFilePath = this.getMinetestConfigTempatePath();
    const templateFile = await fsPromises.open(templateConfigFilePath, 'w+');
    await file.close();
    const templateProperties = PropertiesReader(templateConfigFilePath);
    const properties = templateProperties.clone();
    properties.set('port', port);
    properties.set('remote_port', port);
    properties.set('name', worldAmdinUsername ?? 'w3itch');
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
      name: string;
      world_name: string;
      backend: string;
      player_backend: string;
      readonly_backend: string;
      auth_backend: string;
    },
  ) {
    const worldMtPath = join(tempGameWorldPath, 'world.mt');
    this.logger.debug(`Handle ${worldMtPath}`, this.constructor.name);
    const properties = PropertiesReader(worldMtPath, null, {
      writer: { saveSections: true },
    });
    if (isEmpty(properties.get('gameid'))) {
      properties.set('gameid', 'minetest');
    }
    Object.keys(options).forEach((key) => {
      const value = options[key];
      if (key !== 'gameid' && isNotEmpty(value)) {
        properties.set(key, value);
      }
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

  getMinetestConfigTempatePath(): string {
    return this.getMinetestResourcePath(`minetest.conf.template`);
  }

  getMinetestConfigPathByPort(port: number): string {
    return this.getMinetestResourcePath(`minetest.${port}.conf`);
  }

  async getRunningGameWorldPorts(): Promise<MinetestWorldPortItem[]> {
    return (await this.minetestWorldService.list({ id: 'ASC' })).filter(
      (minetestWorld) => this.childProcesses.has(minetestWorld.port),
    );
  }

  async getPortByGameWorldName(gameWorldName: string): Promise<number> {
    const gameWorld = await this.minetestWorldService.findOneByGameWorldName(
      gameWorldName,
    );
    return gameWorld?.port;
  }

  async restartMinetestServerByGameWorldName(
    currentUsername: string,
    gameWorldName: string,
  ): Promise<{ gameWorldName: string; port: number }> {
    const minetestGame = await this.gamesBaseService.findOneByGameName(
      gameWorldName,
    );
    if (!minetestGame) {
      throw new NotFoundException(`Game world "${gameWorldName}" is not found`);
    }
    if (
      ADMIN_USERNAME !== currentUsername &&
      minetestGame.username !== currentUsername
    ) {
      throw new ForbiddenException(
        'You have no permission to restart this game',
      );
    }
    let port = await this.getPortByGameWorldName(gameWorldName);
    if (!port) {
      port = await this.saveMinetestConfigForGameWorld(
        currentUsername,
        gameWorldName,
      );
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
    const port = await this.getPortByGameWorldName(gameWorldName);

    await this.stopMinetestChildProcessByPort(port);

    return {
      gameWorldName,
      port,
    };
  }

  async listMintestWorlds(order) {
    // More than this number can not rely on a single server, or at least a cluster or other distributed scheme.
    return await this.minetestWorldService.list(order);
  }

  async onApplicationBootstrap() {
    this.logger.log(`Bootstrap application`, this.constructor.name);
    (await this.listMintestWorlds({ id: 'ASC' })).forEach(async (world) => {
      await this.restartMinetestServerByGameWorldName(
        ADMIN_USERNAME,
        world.gameWorldName,
      );
    });
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(
      `Shutting down application, signal: ${signal}`,
      this.constructor.name,
    );
    (await this.listMintestWorlds({ id: 'DESC' })).forEach(async (world) => {
      await this.stopMinetestServerByGameWorldName(world.gameWorldName);
    });
  }
}
