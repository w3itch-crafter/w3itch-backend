import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { isEmpty, isEthereumAddress } from 'class-validator';
import fs from 'fs';
import { readFile } from 'fs/promises';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Paginated } from 'nestjs-paginate';
import path, { join } from 'path';

import { Game } from '../../entities/Game.entity';
import { Tag } from '../../entities/Tag.entity';
import { UserJWTPayload } from '../../types';
import {
  GameEngine,
  Genre,
  PaymentMode,
  ProjectClassification,
} from '../../types/enum';
import { PricesService } from '../prices/prices.service';
import { TagsService } from '../tags/tags.service';
import { DefaultGamesService } from './default.games.service';
import { CreateGameProjectDto } from './dto/create-game-proejct.dto';
import { CreateGameProjectWithFileDto } from './dto/create-game-proejct-with-file.dto';
import { UpdateGameProjectDto } from './dto/update-game-proejct.dto';
import { UpdateGameProjectWithFileDto } from './dto/update-game-proejct-with-file.dto';
import { ValidateGameProjectDto } from './dto/validate-game-proejct.dto';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesBaseService } from './games.base.service';
import { MinetestGamesService } from './minetest.games.service';
<<<<<<< HEAD
import { GameFile, ISpecificGamesService } from './specific.games.service';
=======
import { ISpecificGamesService } from './specific.games.service';
>>>>>>> 6a20bc7c6c7f90db5cc397de6e51214ebcf943e2
import { HtmlGamesService } from './html.games/html.games.service';

const fsPromises = fs.promises;

@Injectable()
export class GamesLogicService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesBaseService: GamesBaseService,
    private readonly tagsService: TagsService,
    private readonly pricesService: PricesService,
    private readonly easyRpgGamesService: EasyRpgGamesService,
    private readonly minetestGamesService: MinetestGamesService,
    private readonly htmlGamesService: HtmlGamesService,
    private readonly defaultGamesService: DefaultGamesService,
  ) {}

  public checkFileMimeTypeAcceptable(file: Express.Multer.File): void {
    if (
      ![
        'application/zip',
        'application/zip-compressed',
        'application/x-zip-compressed',
      ].includes(file.mimetype.toLowerCase())
    ) {
      throw new BadRequestException(`Invalid mimetype: ${file.mimetype}`);
    }
  }

  private async convertTagsAndPricesFromDtoToEntities(
    game: CreateGameProjectDto | UpdateGameProjectDto,
  ): Promise<Partial<Game>> {
    const tags: Tag[] = await this.tagsService.getOrCreateByNames(game.tags);

    this.logger.verbose(
      `Tags of game are ${JSON.stringify(tags)}`,
      this.constructor.name,
    );

    const prices = game.prices
      ? await Promise.all(
          game.prices.map(async (dto) => {
            return await this.pricesService.save(dto);
          }),
        )
      : undefined;

    return {
      ...game,
      tags,
      prices,
    };
  }

  public async saveUploadedFile(
    file: Express.Multer.File,
    gameName: string,
  ): Promise<void> {
    const downloadPath = path.join('thirdparty', 'downloads', gameName);
    await fsPromises.mkdir(downloadPath, { recursive: true });
    fs.createWriteStream(path.join(downloadPath, file.originalname)).write(
      file.buffer,
    );
    this.logger.log(
      `File ${file.originalname} was saved to ${downloadPath}`,
      this.constructor.name,
    );
  }

  public async paginateGameProjects(query, options): Promise<Paginated<Game>> {
    return await this.gamesBaseService.paginateGameProjects(query, options);
  }

  public async findOne(id: number): Promise<Game> {
    return await this.gamesBaseService.findOne(id);
  }

  public async createGameProject(
    user: Pick<UserJWTPayload, 'id' | 'username'>,
    file: Express.Multer.File,
    body: CreateGameProjectWithFileDto,
  ): Promise<Game> {
    const { game } = body;
    await this.gamesBaseService.validateGameName(game);
    await this.validateAndFixDonationAddress(game);
    this.logger.verbose(
      `File: ${file.originalname}, Game: ${JSON.stringify(game)}`,
      this.constructor.name,
    );
    this.checkFileMimeTypeAcceptable(file);

    this.fixGameKindAndGenreByClassification(game);

    await this.getSpecificGamesService(game.kind).uploadGame(user, file, game);

    const gameEntityPartial = await this.convertTagsAndPricesFromDtoToEntities(
      game,
    );
    const gameProject = await this.gamesBaseService.save({
      ...gameEntityPartial,
      username: user.username,
      file: file.originalname,
    });
    await this.saveUploadedFile(file, game.gameName);
    return gameProject;
  }

  fixGameKindAndGenreByClassification(game: CreateGameProjectDto) {
    if (
      game.classification &&
      ProjectClassification.GAMES !== game.classification
    ) {
      game.kind = GameEngine.DOWNLOADABLE;
      game.genre = Genre.NO_GENRE;
    }
  }

  getSpecificGamesService(kind: GameEngine): ISpecificGamesService {
    if (GameEngine.RM2K3E === kind) {
      return this.easyRpgGamesService;
    } else if (GameEngine.MINETEST === kind) {
      return this.minetestGamesService;
    } else if (GameEngine.HTML === kind) {
      return this.htmlGamesService;
    } else {
      return this.defaultGamesService;
    }
  }

  public async updateGameProject(
    id: number,
    user: Pick<UserJWTPayload, 'id' | 'username'>,
    file: Express.Multer.File,
    body: UpdateGameProjectWithFileDto,
  ): Promise<Game> {
    await this.gamesBaseService.verifyOwner(id, user);

    const { game } = body;
    const target = await this.gamesBaseService.findOne(id);
    if (!game.paymentMode) {
      game.paymentMode = target.paymentMode;
    }
    await this.validateAndFixDonationAddress(game);

    // `file` means the uploaded file
    // `gameFile` means game's corresponding file
    let gameFile: GameFile = file;
    if (file || game?.charset) {
      this.logger.verbose(
        `Update File: ${
          file?.originalname ?? target.file
        }, Game: ${JSON.stringify(game)}`,
        this.constructor.name,
      );

      if (file) {
        this.checkFileMimeTypeAcceptable(file);
      } else {
        const fileBuffer = await readFile(
          join('thirdparty', 'downloads', target.gameName, target.file),
        );
        gameFile = {
          buffer: fileBuffer,
          originalname: target.file,
        };
      }

      // minetest world database files should not be overwritten when updating game world info
      // easyprg theoretically does not need to do so either, currently this is for scenarios where the game encoding is not chosen correctly so that it does not need to be re-uploaded, but rather re-decompressed
      if (gameFile || target.kind === GameEngine.RM2K3E) {
        if (game.charset) {
          target.charset = game.charset;
        }
        await this.getSpecificGamesService(target.kind).uploadGame(
          user,
          gameFile,
          target,
        );
      }
    } else {
      this.logger.verbose(
        `Update game entity: ${JSON.stringify(game)} with no file update`,
        this.constructor.name,
      );
    }

    const gameEntityPartial = await this.convertTagsAndPricesFromDtoToEntities(
      game,
    );

    if (file) {
      gameEntityPartial.file = file.originalname;
      // await this.saveUploadedFile(file, target.gameName);
    }
    return await this.gamesBaseService.update(id, gameEntityPartial);
  }

  public async delete(id: number, user: UserJWTPayload): Promise<void> {
    await this.gamesBaseService.verifyOwner(id, user);

    const target = await this.gamesBaseService.findOne(id);
    this.getSpecificGamesService(target.kind).deleteGameResourceDirectory(
      target.gameName,
    );
    await this.gamesBaseService.delete(id);
  }

  public async deleteGameProjectFiles(id: number, user: UserJWTPayload) {
    await this.gamesBaseService.verifyOwner(id, user);

    const target = await this.gamesBaseService.findOne(id);
    await this.gamesBaseService.update(id, { file: null });
    this.getSpecificGamesService(target.kind).deleteGameResourceDirectory(
      target.gameName,
    );
  }

  public async validateGameName(game: ValidateGameProjectDto): Promise<void> {
    await this.gamesBaseService.validateGameName(game);
  }

  public validateAndFixDonationAddress(createOrUpdateGameDto: {
    paymentMode?: PaymentMode;
    donationAddress?: string;
  }): string {
    if (PaymentMode.FREE === createOrUpdateGameDto?.paymentMode) {
      if (
        isEmpty(createOrUpdateGameDto?.donationAddress) ||
        isEthereumAddress(createOrUpdateGameDto?.donationAddress)
      ) {
        return createOrUpdateGameDto.donationAddress;
      }
      throw new BadRequestException(
        'donation address must be an Ethereum address',
      );
    } else if (
      PaymentMode.PAID === createOrUpdateGameDto?.paymentMode &&
      (isEmpty(createOrUpdateGameDto?.donationAddress) ||
        isEthereumAddress(createOrUpdateGameDto?.donationAddress))
    ) {
      return createOrUpdateGameDto.donationAddress;
    } else if (
      PaymentMode.DISABLE_PAYMENTS === createOrUpdateGameDto?.paymentMode
    ) {
      createOrUpdateGameDto.donationAddress = null;
      return null;
    } else {
      delete createOrUpdateGameDto.donationAddress;
      return undefined;
    }
  }
}
