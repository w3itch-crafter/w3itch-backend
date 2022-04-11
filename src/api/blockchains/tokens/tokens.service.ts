import {
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { Token } from '../../../entities/Token.entity';
import { CreateTokenDto } from './dto/create-token.dto';
import { DeleteTokenDto } from './dto/delete-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Injectable()
export class TokensService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async getTokensByChainId(chainId: number): Promise<Token[]> {
    return await this.tokenRepository.find({
      where: { chainId },
    });
  }

  public async create(chainId: number, dto: CreateTokenDto): Promise<Token> {
    const exists = await this.tokenRepository.findOne({
      where: { address: dto.address },
    });
    if (exists) {
      throw new ConflictException('Token already exists');
    }
    return await this.tokenRepository.save({ chainId, ...dto });
  }

  public async update(chainId: number, dto: UpdateTokenDto): Promise<Token> {
    const entity = await this.tokenRepository.findOne({
      where: {
        address: dto.address,
        chainId,
      },
    });
    if (!entity) {
      throw new NotFoundException('Token not found');
    }
    return await this.tokenRepository.save({ ...entity, ...dto });
  }

  public async delete(chainId: number, dto: DeleteTokenDto): Promise<void> {
    const entity = await this.tokenRepository.findOne({
      where: {
        address: dto.address,
        chainId,
      },
    });
    if (!entity) {
      throw new NotFoundException('Token not found');
    }
    await this.tokenRepository.delete(entity.id);
  }
}
