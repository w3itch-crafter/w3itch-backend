import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { Tag } from '../../entities/Tag.entity';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GameProjectsController } from './game-projects.controller';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Tag])],
  controllers: [GamesController, GameProjectsController],
  providers: [GamesService, EasyRpgGamesService],
  exports: [GamesService, EasyRpgGamesService],
})
export class GamesModule {}
