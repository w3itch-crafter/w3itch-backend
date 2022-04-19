import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { Token } from '../../../entities/Token.entity';
import { Web3Provider, web3Providers } from './web3.provider';

@Injectable()
export class TokensService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
  ) {}

  public async getTokensByChainId(chainId: number): Promise<Token[]> {
    return await this.tokenRepository.find({
      where: { chainId },
    });
  }

  public async findOneOrCreate(
    chainId: number,
    address: string,
  ): Promise<Token> {
    let token = await this.tokenRepository.findOne({
      where: { chainId, address },
    });
    if (!token) {
      token = await this.save(chainId, address);
    }
    return token;
  }

  public async save(chainId: number, address: string): Promise<Token> {
    const info = await web3Providers.get(chainId).getTokenInfo(address);
    return await this.tokenRepository.save({ chainId, address, ...info });
  }
}
