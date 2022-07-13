import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { IoModule } from '../../io/io.module';
import { PricesModule } from '../prices/prices.module';
import { StoragesModule } from '../storages/module';
import { TagsModule } from '../tags/tags.module';
import { DefaultGamesService } from './default.games.service';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GameProjectsController } from './game-projects.controller';
import { GamesBaseService } from './games.base.service';
import { GamesController } from './games.controller';
import { GamesLogicService } from './games.logic.service';
import { HtmlGamesService } from './html.games/html.games.service';
import { MinetestGamesController } from './minetest.games.controller';
import { MinetestGamesService } from './minetest.games.service';
import { MinetestWorldsModule } from './minetest-worlds/minetest-worlds.module';

@Module({
  imports: [
    TagsModule,
    PricesModule,
    MinetestWorldsModule,
    StoragesModule,
    TypeOrmModule.forFeature([Game]),
    IoModule,
  ],
  controllers: [
    GamesController,
    GameProjectsController,
    MinetestGamesController,
  ],
  providers: [
    GamesLogicService,
    GamesBaseService,
    EasyRpgGamesService,
    MinetestGamesService,
    DefaultGamesService,
    HtmlGamesService,
  ],
  exports: [
    GamesLogicService,
    GamesBaseService,
    EasyRpgGamesService,
    MinetestGamesService,
    HtmlGamesService,
    DefaultGamesService,
  ],
})
export class GamesModule {}
