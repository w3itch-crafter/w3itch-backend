import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { In, Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';

@Injectable()
export class GamesQueryService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  public async queryGamesList(options): Promise<Pagination<Game>> {
    const queryBuilder = this.gameRepository.createQueryBuilder();
    queryBuilder.orderBy(options.sortBy, options.order);
    queryBuilder.where({ tags: In(options.tags) });

    return paginate<Game>(queryBuilder, {
      page: options.page,
      limit: options.limit,
      route: '/games',
    });
  }
}
