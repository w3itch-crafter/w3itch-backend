import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { Price } from '../../entities/Price.entity';
import { User } from '../../entities/User.entity';
import { GamesService } from '../games/games.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PricesBaseService } from './prices.base.service';

@Injectable()
export class PricesLogicService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesService: GamesService,
    private readonly pricesBaseService: PricesBaseService,
  ) {}

  public async findByGameId(gameId: number): Promise<Price[]> {
    return await this.pricesBaseService.find({ where: { game: gameId } });
  }

  public async saveByUser(
    user: User,
    gameId: number,
    chainId: number,
    dto: CreatePriceDto,
  ): Promise<Price> {
    await this.gamesService.verifyOwner(gameId, user);
    return await this.pricesBaseService.save(gameId, chainId, dto);
  }

  public async updateByUser(
    user: User,
    gameId: number,
    chainId: number,
    dto: UpdatePriceDto,
  ): Promise<Price> {
    await this.gamesService.verifyOwner(gameId, user);
    return await this.pricesBaseService.update(gameId, chainId, dto);
  }

  public async deleteByUser(
    user: User,
    gameId: number,
    chainId: number,
  ): Promise<void> {
    await this.gamesService.verifyOwner(gameId, user);
    return await this.pricesBaseService.delete(gameId, chainId);
  }
}
