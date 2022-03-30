import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { Tag } from '../../entities/Tag.entity';
import { GamesController } from './controller';
import { GamesLogicService } from './logic.service';
import { GamesQueryService } from './query.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Tag])],
  controllers: [GamesController],
  providers: [GamesLogicService, GamesQueryService],
  exports: [GamesLogicService, GamesQueryService],
})
export class GamesModule {}
