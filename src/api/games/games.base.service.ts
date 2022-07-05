import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { isNotEmpty } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { paginate, PaginateConfig, Paginated } from 'nestjs-paginate';
import { Brackets, FindManyOptions, ILike, IsNull, Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { User } from '../../entities/User.entity';
import { UpdateGameEntity, UserJWTPayload } from '../../types';
import { AccessType, GamesListSortBy } from '../../types/enum';
import { entityShouldExists } from '../../utils';
import { ValidateGameProjectDto } from './dto/validate-game-proejct.dto';

@Injectable()
export class GamesBaseService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  private static appendParams(target, options) {
    if (!target) return target;
    const url = new URL(target);
    delete options.page;
    Object.entries(options).forEach(([key, value]: [string, string]) => {
      if (value) {
        if (key === 'sortBy') {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.append(key, value);
        }
      }
    });
    return url.toString();
  }

  public async verifyOwner(
    gameId: number,
    user: Pick<UserJWTPayload, 'id' | 'username'>,
  ) {
    const gameProject = await this.gameRepository.findOne(gameId);

    if (!gameProject) {
      throw new NotFoundException('Game project not found');
    }

    if (user.username !== gameProject.username) {
      throw new ForbiddenException(
        "You don't have permission to modify this game project",
      );
    }
  }

  public async paginateGameProjects(
    currentUsername: string | null,
    query,
    options,
  ): Promise<Paginated<Game>> {
    query.sortBy = [[options.sortBy, options.order]];
    query.tags = options.tags;

    this.logger.verbose(
      `Query: ${JSON.stringify(query)}; queryOptions: ${JSON.stringify(
        options,
      )}`,
      this.constructor.name,
    );

    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .leftJoin('game.tags', 'tag')
      .leftJoinAndSelect('game.tags', 'tags')
      .leftJoinAndSelect('game.prices', 'prices')
      .leftJoinAndSelect('prices.token', 'token');

    const {
      username,
      paymentMode,
      classification,
      kind,
      genre,
      releaseStatus,
      donationAddress,
    } = options;
    if (username) {
      queryBuilder.andWhere('game.accessType = :accessType', {
        accessType: AccessType.PUBLIC,
      });
    } else {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('game.accessType = :accessType', {
            accessType: AccessType.PUBLIC,
          });
          qb.orWhere('game.username = :username', {
            username: currentUsername,
          });
        }),
      );
    }
    if (isNotEmpty(username)) {
      queryBuilder.andWhere('game.username = :username', {
        username,
      });
    }
    if (isNotEmpty(paymentMode)) {
      queryBuilder.andWhere('game.paymentMode = :paymentMode', {
        paymentMode,
      });
    }
    if (isNotEmpty(classification)) {
      queryBuilder.andWhere('game.classification = :classification', {
        classification,
      });
    }
    if (isNotEmpty(kind)) {
      queryBuilder.andWhere('game.kind = :kind', {
        kind,
      });
    }

    if (isNotEmpty(genre)) {
      queryBuilder.andWhere('game.genre = :genre', {
        genre,
      });
    }

    if (isNotEmpty(releaseStatus)) {
      queryBuilder.andWhere('game.releaseStatus = :releaseStatus', {
        releaseStatus,
      });
    }

    if (isNotEmpty(donationAddress)) {
      queryBuilder.andWhere('game.donationAddress = :donationAddress', {
        donationAddress,
      });
    }

    const { tags } = options;
    if (isNotEmpty(tags)) {
      (tags instanceof Array ? tags : [tags]).forEach((tag) => {
        queryBuilder.andWhere('tag.name = :tag', { tag });
      });
    }

    const config: PaginateConfig<Game> = {
      sortableColumns: Object.values(GamesListSortBy),
    };

    const result = await paginate<Game>(query, queryBuilder, config);
    if (result.links) {
      Object.keys(result.links).map(function (key) {
        if (result.links[key]) {
          result.links[key] = GamesBaseService.appendParams(
            result.links[key],
            options,
          );
        }
      });
    }
    return result;
  }

  public async find(options?: FindManyOptions<Game>): Promise<Game[]> {
    return this.gameRepository.find(options);
  }

  public async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id, {
      relations: ['tags', 'prices', 'prices.token'],
    });
    entityShouldExists(game, Game);
    return game;
  }

  public async findOneByGameName(gameName: string): Promise<Game> {
    return await this.gameRepository.findOne({ gameName });
  }

  public async findOneByProjectURL(
    username: string,
    projectURL: string,
  ): Promise<Game> {
    return await this.gameRepository.findOne({ username, projectURL });
  }

  public async save(game: Partial<Game>): Promise<Game> {
    return await this.gameRepository.save(game);
  }

  public async update(id, update: Partial<UpdateGameEntity>): Promise<Game> {
    return await this.gameRepository.save({ id, ...update });
  }

  public async delete(id: number): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async validateGameName(game: ValidateGameProjectDto): Promise<void> {
    if (game.gameName) {
      const gameExisted = await this.gameRepository.findOne({
        where: { gameName: ILike(game.gameName) },
      });
      if (gameExisted) {
        throw new ConflictException(
          `One game with this name already exists. ID: ${gameExisted.id} Submitter: ${gameExisted.username}`,
        );
      }
    }
  }
}
