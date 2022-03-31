import {
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { BaseEntity } from '../../entities/base.entity';
import { Game } from '../../entities/Game.entity';

@Injectable()
export class GamesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  public async paginateGameProjects(options): Promise<Pagination<Game>> {
    const queryBuilder = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.tags', 'tags')
      .orderBy(`game.${options.sortBy}`, options.order);

    return paginate<Game>(queryBuilder, {
      page: options.page,
      limit: options.limit,
      route: '/game-projects',
    });
  }

  public async getGameProjectById(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  public async save(
    game: Omit<Game, keyof BaseEntity | 'ratings'>,
  ): Promise<Game> {
    console.log({ game });
    return await this.gameRepository.save(game);
  }

  public async validateGameName(gameName: string): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { gameName } });
    if (game) {
      throw new ConflictException('Game name already exists');
    }
  }
}