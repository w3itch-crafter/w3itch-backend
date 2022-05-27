import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';

import { MinetestGamesService } from './minetest.games.service';

describe('MinetestGamesService', () => {
  let service: MinetestGamesService;

  const configuration = () => ({
    game: {
      minetest: {
        binPath: '/usr/share/minetest/bin/mintest',
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
      console.log(path);
      expect(path).toEqual(
        join(configuration().game.minetest.basePath, `minetest.${port}.conf`),
      );
    });
  });

  describe('handleWorldMtFile', () => {
    it('options shoule be saved to config`', async () => {
      const path = service.getMinetestResourcePath(join('worlds', 'world1'));
      const options = {
        gameid: 'minetest',
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
    it('name shoule not be updated`', async () => {
      const path = service.getMinetestResourcePath(join('worlds', 'world1'));
      const options = {
        gameid: 'minetest',
        backend: 'sqlite3',
        player_backend: 'sqlite3',
        readonly_backend: 'sqlite3',
        auth_backend: 'sqlite3',
      };
      const props = await service.handleWorldMtFile(path, options);

      expect(props.get('name')).toEqual('worldadmin');
    });
  });
});
