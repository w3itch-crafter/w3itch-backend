import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { Price } from '../../entities/Price.entity';
import { Token } from '../../entities/Token.entity';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@Injectable()
export class PricesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async findByGameId(gameId: number): Promise<Price[]> {
    return await this.priceRepository.find({
      where: { game: gameId },
    });
  }

  public async create(
    gameId: number,
    chainId: number,
    dto: CreatePriceDto,
  ): Promise<Price> {
    const exists = await this.priceRepository.findOne({
      where: { game: gameId, chainId },
    });
    if (exists) {
      throw new ConflictException('Price already exists');
    }
    const token = await this.tokenRepository.findOne({
      where: { address: dto.tokenAddress },
    });
    if (token) {
      throw new NotFoundException('Token not found');
    }
    if (chainId !== token.chainId) {
      throw new BadRequestException('Token does not belong to this chain');
    }
    return await this.priceRepository.save({ chainId, gameId, ...dto });
  }

  public async update(
    gameId: number,
    chainId: number,
    dto: UpdatePriceDto,
  ): Promise<Price> {
    const entity = await this.priceRepository.findOne({
      relations: ['token'],
      where: { game: gameId, chainId },
    });
    if (!entity) {
      throw new NotFoundException('Price not found');
    }
    if (!entity.token) {
      throw new NotFoundException('Token not found');
    }
    if (chainId !== entity.token.chainId) {
      throw new BadRequestException('Token does not belong to this chain');
    }
    return await this.priceRepository.save({ ...entity, ...dto });
  }

  public async delete(gameId: number, chainId: number): Promise<void> {
    const price = await this.priceRepository.findOne({
      where: { game: gameId, chainId },
    });
    if (!price) {
      throw new NotFoundException('Price not found');
    }
    await this.priceRepository.delete(price.id);
  }
}
