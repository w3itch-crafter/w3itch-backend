import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { PricesModule } from '../prices/prices.module';
import { TagsModule } from '../tags/tags.module';
import { DefaultGamesService } from './default.games.service';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GameProjectsController } from './game-projects.controller';
import { GamesBaseService } from './games.base.service';
import { GamesController } from './games.controller';
import { GamesLogicService } from './games.logic.service';
import { MinetestGamesService } from './minetest.games.service';

@Module({
  imports: [TagsModule, PricesModule, TypeOrmModule.forFeature([Game])],
  controllers: [GamesController, GameProjectsController],
  providers: [
    GamesLogicService,
    GamesBaseService,
    EasyRpgGamesService,
    MinetestGamesService,
    DefaultGamesService,
  ],
  exports: [
    GamesLogicService,
    GamesBaseService,
    EasyRpgGamesService,
    MinetestGamesService,
    DefaultGamesService,
  ],
})
export class GamesModule {}
