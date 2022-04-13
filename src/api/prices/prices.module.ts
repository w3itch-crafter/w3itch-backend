import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Price } from '../../entities/Price.entity';
import { TokensModule } from '../blockchains/tokens/tokens.module';
import { PricesService } from './prices.service';

@Module({
  imports: [TokensModule, TypeOrmModule.forFeature([Price])],
  providers: [PricesService],
  exports: [PricesService],
})
export class PricesModule {}
