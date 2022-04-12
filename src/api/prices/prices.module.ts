import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { Price } from '../../entities/Price.entity';
import { Token } from '../../entities/Token.entity';
import { GamesModule } from '../games/games.module';
import { TagsModule } from '../tags/tags.module';
import { PricesBaseService } from './prices.base.service';
import { PricesController } from './prices.controller';
import { PricesLogicService } from './prices.logic.service';

@Module({
  imports: [
    GamesModule,
    TagsModule,
    TypeOrmModule.forFeature([Game, Price, Token]),
  ],
  controllers: [PricesController],
  providers: [PricesBaseService, PricesLogicService],
  exports: [PricesBaseService, PricesLogicService],
})
export class PricesModule {}
