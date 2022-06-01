import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';

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
    it('options shoule be saved to config`', async () => {
      const path = service.getMinetestResourcePath(join('worlds', 'world1'));
      const options = {
        name: 'worldadmin',
        gameid: 'minetest',
        world_name: 'world1',
        backend: 'sqlite3',
        player_backend: 'sqlite3',
        readonly_backend: 'sqlite3',
        auth_backend: 'sqlite3',
      };
      const props = await service.handleWorldMtFile(path, options);
      Object.keys(options).forEach((key) => {
        expect(props.get(key)).toEqual(options[key]);
      });
    });
    it('non-empty name should override the original configuration`', async () => {
      const path = service.getMinetestResourcePath(join('worlds', 'world1'));
      const options = {
        name: 'worldadmin',
        gameid: 'minetest',
        world_name: 'world1',
        backend: 'sqlite3',
        player_backend: 'sqlite3',
        readonly_backend: 'sqlite3',
        auth_backend: 'sqlite3',
      };
      const props = await service.handleWorldMtFile(path, options);

      expect(props.get('name')).toEqual('worldadmin');
    });

    it('empty name should not override the original configurationd', async () => {
      const path = service.getMinetestResourcePath(join('worlds', 'world1'));
      const options = {
        name: '',
        gameid: 'minetest',
        world_name: 'world1',
        backend: 'sqlite3',
        player_backend: 'sqlite3',
        readonly_backend: 'sqlite3',
        auth_backend: 'sqlite3',
      };
      const props = await service.handleWorldMtFile(path, options);

      expect(props.get('name')).not.toBe('');
    });
  });
});
