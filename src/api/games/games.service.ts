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
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { PostedGameEntity } from '../../types';
import { UpdateGameProjectDto } from './dto/update-game-proejct.dto';

@Injectable()
export class GamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  public async paginateGameProjects(options): Promise<Pagination<Game>> {
    this.logger.verbose(
      `Query: ${JSON.stringify(options)}`,
      this.constructor.name,
    );

    const { page, limit, username, sortBy, order } = options;

    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .leftJoin('game.tags', 'tag')
      .leftJoinAndSelect('game.tags', 'tagSelect')
      .orderBy(`game.${sortBy}`, order);

    if (username) {
      queryBuilder.andWhere('game.username = :username', {
        username: username,
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

    return paginate<Game>(queryBuilder, {
      page,
      limit,
      route: '/game-projects',
    });
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

  public async update(id, game: Partial<PostedGameEntity>): Promise<Game> {
    return await this.gameRepository.save({ id, game });
  }

  public async delete(id: number): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async validateGameName(game: UpdateGameProjectDto): Promise<void> {
    const exists = await this.gameRepository.findOne({
      where: { gameName: game.gameName },
    });
    if (exists) {
      throw new ConflictException('Game name already exists');
    }
  }
}
