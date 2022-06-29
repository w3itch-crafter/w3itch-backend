import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';

import { UpdateGameEntity } from '../../types';
import {
  Community,
  GameEngine,
  GameFileCharset,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../../types/enum';
import { TokensService } from '../blockchains/tokens/tokens.service';
import { PricesService } from '../prices/prices.service';
import { StoragesService } from '../storages/service';
import { TagsService } from '../tags/tags.service';
import { DefaultGamesService } from './default.games.service';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesBaseService } from './games.base.service';
import { GamesLogicService } from './games.logic.service';
import { MinetestGamesService } from './minetest.games.service';
import { MinetestWorldsService } from './minetest-worlds/minetest-worlds.service';
import { HtmlGamesService } from './html.games/html.games.service';
import { FilesystemService } from '../../io/filesystem/filesystem.service';
import { ZipService } from '../../io/zip/zip.service';

describe('GamesLogicService', () => {
  let service: GamesLogicService;
  let easyRpgGamesService: EasyRpgGamesService;
  let minetestGamesService: MinetestGamesService;
  let defaultGamesService: DefaultGamesService;
  let gamesBaseService: GamesBaseService;
  let tagsService: TagsService;
  let pricesService: PricesService;

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
        MinetestWorldsService,
        HtmlGamesService,
        DefaultGamesService,
        TokensService,
        StoragesService,
        FilesystemService,
        ZipService,
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
        {
          provide: 'MinetestWorldRepository',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GamesLogicService>(GamesLogicService);
    easyRpgGamesService = module.get<EasyRpgGamesService>(EasyRpgGamesService);
    minetestGamesService =
      module.get<MinetestGamesService>(MinetestGamesService);
    defaultGamesService = module.get<DefaultGamesService>(DefaultGamesService);
    gamesBaseService = module.get<GamesBaseService>(GamesBaseService);
    tagsService = module.get<TagsService>(TagsService);
    pricesService = module.get<PricesService>(PricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSpecificGamesService', () => {
    it('should return easyRpgGamesService when kind of game project is `rm2k3e`', async () => {
      expect(service.getSpecificGamesService(GameEngine.RM2K3E)).toEqual(
        easyRpgGamesService,
      );
    });
    it('should return minetestGamesService when kind of game project is `mt`', async () => {
      expect(service.getSpecificGamesService(GameEngine.MINETEST)).toEqual(
        minetestGamesService,
      );
    });
    it('should return defaultGamesService when kind of game project is `downloadable`', async () => {
      expect(service.getSpecificGamesService(GameEngine.DOWNLOADABLE)).toEqual(
        defaultGamesService,
      );
    });
  });

  describe('updateGameProject', () => {
    const gameSample = {
      id: 11,
      username: 'alice',
      title: "Alice's World",
      subtitle: '-',
      description: '-',
      gameName: 'alices_world',
      file: 'alices_world.zip',
      classification: ProjectClassification.GAMES,
      kind: GameEngine.RM2K3E,
      genre: Genre.ROLE_PLAYING,
      paymentMode: PaymentMode.FREE,
      charset: GameFileCharset.UTF8,
      cover: 'https://image.example.com/1',
      screenshots: [],
      tags: [],
      prices: [],
      appStoreLinks: [],
      releaseStatus: ReleaseStatus.RELEASED,
      rating: 500,
      community: Community.DISABLED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    function mockMethods(gameInDatabase) {
      jest
        .spyOn(gamesBaseService, 'validateGameName')
        .mockImplementationOnce(async (game) => {
          return;
        });
      jest
        .spyOn(gamesBaseService, 'verifyOwner')
        .mockImplementationOnce(async (game) => {
          return;
        });
      jest
        .spyOn(gamesBaseService, 'findOne')
        .mockImplementationOnce(async (id) => gameInDatabase);
      jest
        .spyOn(tagsService, 'getOrCreateByNames')
        .mockImplementationOnce(async (tags) => []);
      jest
        .spyOn(pricesService, 'save')
        .mockImplementationOnce(async (price) => undefined);
      jest
        .spyOn(gamesBaseService, 'update')
        .mockImplementationOnce(
          async (id, update: Partial<UpdateGameEntity>) => {
            const gameInDatabaseUpdated = {
              ...gameInDatabase,
              ...update,
            };

            if (update.donationAddress === null) {
              gameInDatabaseUpdated.donationAddress = null;
            }
            return gameInDatabaseUpdated;
          },
        );
    }
    it('should not update kind', async () => {
      const gameInDatabase = { ...gameSample };
      mockMethods(gameInDatabase);
      const gameUpdated = await service.updateGameProject(
        1,
        {
          id: 1,
          username: 'alice',
        },
        null,
        {
          game: {
            title: 'Title updated',
          },
        },
      );
      expect(gameUpdated?.title).toEqual('Title updated');
      expect(gameUpdated?.classification).toEqual(ProjectClassification.GAMES);
      expect(gameUpdated?.kind).toEqual(GameEngine.RM2K3E);
      expect(gameUpdated?.donationAddress).toBeUndefined();
    });

    it('donation address could be set to empty if payment mode is FREE', async () => {
      const gameInDatabase = {
        ...gameSample,
        donationAddress: '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1',
      };

      mockMethods(gameInDatabase);
      const gameUpdated = await service.updateGameProject(
        1,
        {
          id: 1,
          username: 'alice',
        },
        null,
        {
          game: {
            donationAddress: '',
          },
        },
      );
      expect(gameUpdated?.donationAddress).toEqual('');
    });

    it('donation address could be set to empty if payment mode is FREE', async () => {
      const gameInDatabase = {
        ...gameSample,
        donationAddress: '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1',
      };
      mockMethods(gameInDatabase);
      const gameUpdated = await service.updateGameProject(
        1,
        {
          id: 1,
          username: 'alice',
        },
        null,
        {
          game: {
            donationAddress: '',
          },
        },
      );
      expect(gameUpdated?.donationAddress).toEqual('');
    });

    it('donation address could be set to empty if payment mode is PAID', async () => {
      const gameInDatabase = {
        ...gameSample,
        paymentMode: PaymentMode.PAID,
        donationAddress: '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1',
        prices: [{}],
      };
      mockMethods(gameInDatabase);
      const gameUpdated = await service.updateGameProject(
        1,
        {
          id: 1,
          username: 'alice',
        },
        null,
        {
          game: {
            donationAddress: '',
          },
        },
      );
      expect(gameUpdated?.paymentMode).toEqual(PaymentMode.PAID);
      expect(gameUpdated?.donationAddress).toEqual('');
    });

    it('donation address should be empty if payment mode is updated to DISABLE_PAYMENTS', async () => {
      const gameInDatabase = {
        ...gameSample,
        paymentMode: PaymentMode.PAID,
        donationAddress: '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1',
        prices: [{}],
      };
      mockMethods(gameInDatabase);
      const gameUpdated = await service.updateGameProject(
        1,
        {
          id: 1,
          username: 'alice',
        },
        null,
        {
          game: {
            paymentMode: PaymentMode.DISABLE_PAYMENTS,
          },
        },
      );
      expect(gameUpdated?.paymentMode).toEqual(PaymentMode.DISABLE_PAYMENTS);
      expect(gameUpdated?.donationAddress).toBeNull();
    });

    it('should throw error if paymentMode is FREE & donation address is invalid', async () => {
      const donationAddress = '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1';
      const gameInDatabase = {
        ...gameSample,
        donationAddress,
      };
      mockMethods(gameInDatabase);
      expect(
        async () =>
          await service.updateGameProject(
            1,
            {
              id: 1,
              username: 'alice',
            },
            null,
            {
              game: {
                donationAddress: 'blabla',
              },
            },
          ),
      ).rejects.toThrowError('donation address must be an Ethereum address');
    });
  });

  describe('validateAndFixDonationAddress', () => {
    it('should keep valid donation address if paymentMode is FREE or PAID', async () => {
      const donationAddress = '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1';
      const freeGame = {
        paymentMode: PaymentMode.FREE,
        donationAddress,
      };
      service.validateAndFixDonationAddress(freeGame);
      expect(freeGame?.donationAddress).toEqual(donationAddress);

      const paidGame = {
        paymentMode: PaymentMode.PAID,
        donationAddress,
      };
      service.validateAndFixDonationAddress(paidGame);
      expect(paidGame?.donationAddress).toEqual(donationAddress);
    });
    it('should keep empty donation address if paymentMode is FREE or PAID for updating game project', async () => {
      const donationAddress = '';
      const freeGame = {
        paymentMode: PaymentMode.FREE,
        donationAddress,
      };
      service.validateAndFixDonationAddress(freeGame);
      expect(freeGame?.donationAddress).toEqual(donationAddress);

      const paidGame = {
        paymentMode: PaymentMode.PAID,
        donationAddress,
      };
      service.validateAndFixDonationAddress(paidGame);
      expect(paidGame?.donationAddress).toEqual(donationAddress);
    });
    it('should throw error if paymentMode is FREE &  donation address is invalid', async () => {
      const donationAddress = 'discord';
      const freeGame = {
        paymentMode: PaymentMode.FREE,
        donationAddress,
      };
      expect(() =>
        service.validateAndFixDonationAddress(freeGame),
      ).toThrowError('donation address must be an Ethereum address');
    });
    it('should delete invalid donation address if paymentMode is PAID', async () => {
      const donationAddress = 'discord';

      const paidGame = {
        paymentMode: PaymentMode.PAID,
        donationAddress,
      };
      service.validateAndFixDonationAddress(paidGame);
      expect(paidGame?.donationAddress).toBeUndefined();
    });
    it('donation address should be null if paymentMode is DISABLE_PAYMENTS', async () => {
      const donationAddress = '0x1BF07ED4590E10BB35284C7aaA16E86F334Ff7d1';
      const game = {
        paymentMode: PaymentMode.DISABLE_PAYMENTS,
        donationAddress,
      };
      service.validateAndFixDonationAddress(game);
      expect(game?.donationAddress).toBeNull();
    });
  });
});
