import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { Price } from '../../entities/Price.entity';
import { entityShouldExists } from '../../utils';
import { TokensService } from '../blockchains/tokens/tokens.service';
import { CreatePriceDto } from './dto/create-price.dto';

@Injectable()
export class PricesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly tokensService: TokensService,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {}

  public async find(conditions: any): Promise<Price[]> {
    return await this.priceRepository.find(conditions);
  }

  public async save(dto: CreatePriceDto): Promise<Price> {
    const token = await this.tokensService.findOneOrCreate(
      dto.chainId,
      dto.token,
    );
    return await this.priceRepository.save({ ...dto, token });
  }

  public async update(
    gameId: number,
    chainId: number,
    dto: CreatePriceDto,
  ): Promise<Price> {
    const entity = await this.priceRepository.findOne({
      relations: ['token'],
      where: { game: gameId, chainId },
    });
    entityShouldExists(entity, Price);
    entity.amount = dto.amount;
    entity.chainId = dto.chainId;
    entity.token = await this.tokensService.findOneOrCreate(chainId, dto.token);
    return await this.priceRepository.save(entity);
  }

  public async delete(gameId: number, chainId: number): Promise<void> {
    const price = await this.priceRepository.findOne({
      where: { game: gameId, chainId },
    });
    entityShouldExists(price, Price);
    await this.priceRepository.delete(price.id);
  }
}
