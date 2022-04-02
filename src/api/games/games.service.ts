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
import { ILike, Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { Rating } from '../../entities/Rating.entity';
import { PostedGameEntity } from '../../types';
import { UpdateGameProjectDto } from './dto/update-game-proejct.dto';

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
      if (tags instanceof Array) {
        tags.forEach((tag) => {
          queryBuilder.andWhere('tag.name = :tag', { tag });
        });
      } else {
        queryBuilder.andWhere('tag.name = :tag', { tag: tags });
      }
    }

    const config: PaginateConfig<Game> = {
      sortableColumns: ['updatedAt'],
    };

    const result = await paginate<Game>(query, queryBuilder, config);
    Object.keys(result.links).map(function (key) {
      result.links[key] = GamesService.appendParams(result.links[key], options);
    });
    return result;
  }

  public async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  public async save(game: PostedGameEntity): Promise<Game> {
    return await this.gameRepository.save(game);
  }

  public async update(id, update: Partial<PostedGameEntity>): Promise<Game> {
    return await this.gameRepository.save({ id, ...update });
  }

  public async delete(id: number): Promise<void> {
    const game = await this.gameRepository.findOne(id);
    // delete relate ratings
    await Promise.all(
      game.ratings.map(async (rating) => {
        await this.ratingRepository.remove(rating);
      }),
    );
    await this.gameRepository.delete(id);
  }

  public async validateGameName(game: UpdateGameProjectDto): Promise<void> {
    const exists = await this.gameRepository.findOne({
      where: { gameName: ILike(game.gameName) },
    });
    if (exists) {
      throw new ConflictException('Game name already exists');
    }
  }

  public async deleteRating(gameId: number, username: string): Promise<void> {
    const game = await this.gameRepository.findOne(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    const rating = game.ratings.find((r) => r.username === username);
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    await this.ratingRepository.delete(rating.id);
  }

  public async updateRating(
    gameId: number,
    username: string,
    rating: number,
  ): Promise<Game> {
    const game = await this.gameRepository.findOne(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    let entity = game.ratings.find((r) => r.username === username);
    if (entity) {
      entity.rating = rating;
    } else {
      entity = new Rating();
      entity.game = game;
      entity.username = username;
      entity.rating = rating;
      game.ratings.push(entity);
    }
    await this.gameRepository.save(game);
    // query it again to get the updated rating
    return await this.gameRepository.findOne(gameId);
  }
}
