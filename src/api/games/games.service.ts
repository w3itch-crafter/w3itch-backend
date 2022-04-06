import {
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNotEmpty } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { paginate, PaginateConfig, Paginated } from 'nestjs-paginate';
import { getRepository, ILike, Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { Rating } from '../../entities/Rating.entity';
import { UpdateGameEntity } from '../../types';
import { GamesListSortBy } from '../../types/enum';
import { ValidateGameProjectDto } from './dto/validate-game-proejct.dto';

@Injectable()
export class GamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
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

  /**
   * Async task to update the rating column of a game
   * call this method when user add/update/delete a rating
   * @param {number} gameId
   * @returns {Promise<void>}
   * @private
   */
  private async updateGameRating(gameId: number) {
    const ratings = await getRepository(Rating).find({
      where: { gameId },
      select: ['rating'],
    });
    let rating: number | null = null;
    if (ratings.length) {
      const ratingsCount = ratings.length;
      const ratingValues = ratings.map((rating) => rating.rating);
      rating = Math.floor(
        ratingValues.reduce((a, b) => a + b, 0) / ratingsCount,
      );
    }
    await this.gameRepository.save({ id: gameId, rating });
  }

  public async paginateGameProjects(query, options): Promise<Paginated<Game>> {
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
      .leftJoin('game.tags', 'tag');

    if (options.username) {
      queryBuilder.andWhere('game.username = :username', {
        username: options.username,
      });
    }

    const { tags } = options;
    if (isNotEmpty(tags)) {
      (tags instanceof Array ? tags : [tags]).forEach((tag) => {
        queryBuilder.andWhere('tag.name = :tag', { tag });
      });
    }

    const config: PaginateConfig<Game> = {
      relations: ['tags'],
      sortableColumns: Object.values(GamesListSortBy),
    };

    const result = await paginate<Game>(query, queryBuilder, config);
    Object.keys(result.links).map(function (key) {
      result.links[key] = GamesService.appendParams(result.links[key], options);
    });
    return result;
  }

  public async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id, {
      relations: ['tags'],
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  public async save(game: UpdateGameEntity): Promise<Game> {
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
      const exists = await this.gameRepository.findOne({
        where: { gameName: ILike(game.gameName) },
      });
      if (exists) {
        throw new ConflictException('Game name already exists');
      }
    }
  }

  public async deleteRating(gameId: number, username: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { gameId, username },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    await this.ratingRepository.delete(rating.id);
    this.updateGameRating(gameId).then();
  }

  public async updateRating(
    gameId: number,
    username: string,
    rating: number,
  ): Promise<Rating> {
    const game = await this.gameRepository.count({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    let entity = await this.ratingRepository.findOne({
      where: { gameId, username },
    });
    if (entity) {
      entity.rating = rating;
    } else {
      entity = new Rating();
      entity.gameId = gameId;
      entity.username = username;
      entity.rating = rating;
    }
    await this.ratingRepository.save(entity);
    this.updateGameRating(gameId).then();
    return entity;
  }
}
