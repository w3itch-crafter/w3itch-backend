import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { PricesModule } from '../prices/prices.module';
import { TagsModule } from '../tags/tags.module';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GameProjectsController } from './game-projects.controller';
import { GamesBaseService } from './games.base.service';
import { GamesController } from './games.controller';
import { GamesLogicService } from './games.logic.service';

@Module({
  imports: [TagsModule, PricesModule, TypeOrmModule.forFeature([Game])],
  controllers: [GamesController, GameProjectsController],
  providers: [GamesLogicService, GamesBaseService, EasyRpgGamesService],
  exports: [GamesLogicService, GamesBaseService, EasyRpgGamesService],
})
export class GamesModule {}
