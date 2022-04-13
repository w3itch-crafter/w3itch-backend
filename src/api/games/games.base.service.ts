import {
  ConflictException,
  ForbiddenException,
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
import { User } from '../../entities/User.entity';
import { UpdateGameEntity } from '../../types';
import { GamesListSortBy } from '../../types/enum';
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

  public async verifyOwner(gameId: number, user: User) {
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
      .leftJoin('game.tags', 'tag')
      .leftJoinAndSelect('game.tags', 'tags')
      .leftJoinAndSelect('game.prices', 'prices')
      .leftJoinAndSelect('prices.token', 'token');

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
      sortableColumns: Object.values(GamesListSortBy),
    };

    const result = await paginate<Game>(query, queryBuilder, config);
    Object.keys(result.links).map(function (key) {
      result.links[key] = GamesBaseService.appendParams(
        result.links[key],
        options,
      );
    });
    return result;
  }

  public async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id, {
      relations: ['tags', 'prices', 'prices.token'],
    });
    entityShouldExists(game, Game);
    return game;
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
      const exists = await this.gameRepository.findOne({
        where: { gameName: ILike(game.gameName) },
      });
      if (exists) {
        throw new ConflictException('Game name already exists');
      }
    }
  }
}
