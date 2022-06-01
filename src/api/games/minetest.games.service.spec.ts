import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import PropertiesReader from 'properties-reader';

import { GamesBaseService } from './games.base.service';
import { MinetestGamesService } from './minetest.games.service';

describe('MinetestGamesService', () => {
  let service: MinetestGamesService;

  const configuration = () => ({
    game: {
      minetest: {
        binPath: '/usr/bin/mintest',
        basePath: join(process.cwd(), 'test', 'minetest-server'),
      },
    },
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [
        MinetestGamesService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: new Logger(),
        },
        GamesBaseService,
        {
          provide: 'GameRepository',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MinetestGamesService>(MinetestGamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMineTestResourcePath', () => {
    it('base path should read from configuration', async () => {
      const path = service.getMinetestResourcePath(
        join('worlds', 'world1', 'world.mt'),
      );
      expect(path).toEqual(
        join(
          configuration().game.minetest.basePath,
          'worlds',
          'world1',
          'world.mt',
        ),
      );
    });
  });

  describe('getMinetestConfigPathByPort', () => {
    it('base path should read from configuration & config file name should be `minetest.${port}.conf`', async () => {
      const port = 30001;
      const path = service.getMinetestConfigPathByPort(port);
      expect(path).toEqual(
        join(configuration().game.minetest.basePath, `minetest.${port}.conf`),
      );
    });
  });

  describe('handleWorldMtFile', () => {
    type TestWorldCallback = (
      worldPath: string,
      worldName: string,
    ) => Promise<void>;

    async function testWorld(worldName: string, callback: TestWorldCallback) {
      const path = service.getMinetestResourcePath(join('worlds', worldName));
      const worldMtFilePath = join(path, 'world.mt');
      const originalProps = PropertiesReader(worldMtFilePath).clone();
      await callback(path, worldName);
      await originalProps.save(worldMtFilePath);
    }

    it('options should be saved to config except `gameid`', async () => {
      await testWorld('world1', async (path, worldName) => {
        const options = {
          gameid: 'blabla',
          name: 'worldadmin',
          world_name: worldName,
          backend: 'sqlite3',
          player_backend: 'sqlite3',
          readonly_backend: 'sqlite3',
          auth_backend: 'sqlite3',
        };
        const props = await service.handleWorldMtFile(path, options);
        Object.keys(options).forEach((key) => {
          if (key !== 'gameid') {
            expect(props.get(key)).toEqual(options[key]);
          }
        });
      });
    });
    it('non-empty name should override the original configuration`', async () => {
      await testWorld('world1', async (path, worldName) => {
        const options = {
          name: 'worldadmin2',
          world_name: worldName,
          backend: 'sqlite3',
          player_backend: 'sqlite3',
          readonly_backend: 'sqlite3',
          auth_backend: 'sqlite3',
        };
        const props = await service.handleWorldMtFile(path, options);

        expect(props.get('name')).toEqual('worldadmin2');
      });
    });

    it('empty name should not override the original configuration', async () => {
      await testWorld('world1', async (path, worldName) => {
        const options = {
          name: '',
          world_name: worldName,
          backend: 'sqlite3',
          player_backend: 'sqlite3',
          readonly_backend: 'sqlite3',
          auth_backend: 'sqlite3',
        };
        const props = await service.handleWorldMtFile(path, options);

        expect(props.get('name')).not.toBe('');
      });
    });

    it('If `gameid` is specified in the original configuration, leave it as it is', async () => {
      await testWorld('mineclone2_world1', async (path, worldName) => {
        const options = {
          name: 'mcadmin',
          gameid: 'foobar',
          world_name: worldName,
          backend: 'sqlite3',
          player_backend: 'sqlite3',
          readonly_backend: 'sqlite3',
          auth_backend: 'sqlite3',
        };
        const props = await service.handleWorldMtFile(path, options);

        expect(props.get('gameid')).toBe('mineclone2');
      });
    });

    it('If `gameid` is not specified in the original configuration, set it to `minetest`', async () => {
      await testWorld('empty_gameid_world', async (path, worldName) => {
        const options = {
          name: 'empty',
          gameid: 'foobar',
          world_name: worldName,
          backend: 'sqlite3',
          player_backend: 'sqlite3',
          readonly_backend: 'sqlite3',
          auth_backend: 'sqlite3',
        };
        const props = await service.handleWorldMtFile(path, options);

        expect(props.get('gameid')).toBe('minetest');
      });
    });
  });
});
