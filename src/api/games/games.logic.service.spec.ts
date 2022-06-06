import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';

import { GameEngine } from '../../types/enum';
import { TokensService } from '../blockchains/tokens/tokens.service';
import { PricesService } from '../prices/prices.service';
import { StoragesService } from '../storages/service';
import { TagsService } from '../tags/tags.service';
import { DefaultGamesService } from './default.games.service';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesBaseService } from './games.base.service';
import { GamesLogicService } from './games.logic.service';
import { MinetestGamesService } from './minetest.games.service';

describe('GamesLogicService', () => {
  let service: GamesLogicService;
  let easyRpgGamesService: EasyRpgGamesService;
  let minetestGamesService: MinetestGamesService;
  let defaultGamesService: DefaultGamesService;

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
        GamesLogicService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: new Logger(),
        },
        GamesBaseService,
        TagsService,
        PricesService,
        EasyRpgGamesService,
        MinetestGamesService,
        DefaultGamesService,
        TokensService,
        StoragesService,
        {
          provide: 'GameRepository',
          useValue: {},
        },
        {
          provide: 'TagRepository',
          useValue: {},
        },
        {
          provide: 'PriceRepository',
          useValue: {},
        },
        {
          provide: 'TokenRepository',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GamesLogicService>(GamesLogicService);
    easyRpgGamesService = module.get<EasyRpgGamesService>(EasyRpgGamesService);
    minetestGamesService =
      module.get<MinetestGamesService>(MinetestGamesService);
    defaultGamesService = module.get<DefaultGamesService>(DefaultGamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSpecificGamesService', () => {
    it('should return easyPrgGamesService when kind of game project is `rm2k3e`', async () => {
      expect(service.getSpecificGamesService(GameEngine.RM2K3E)).toEqual(
        easyRpgGamesService,
      );
    });
    it('should return minetestGamesService when kind of game project is `mt`', async () => {
      expect(service.getSpecificGamesService(GameEngine.MINETEST)).toEqual(
        minetestGamesService,
      );
    });
    it('should return defaulttGamesService when kind of game project is `downloabable`', async () => {
      expect(service.getSpecificGamesService(GameEngine.DOWNLOADABLE)).toEqual(
        defaultGamesService,
      );
    });
  });
});
