import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/Game.entity';
import { Rating } from '../../entities/Rating.entity';
import { Tag } from '../../entities/Tag.entity';
import { TagsModule } from '../tags/tags.module';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GameProjectsController } from './game-projects.controller';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [TagsModule, TypeOrmModule.forFeature([Game, Tag, Rating])],
  controllers: [GamesController, GameProjectsController],
  providers: [GamesService, EasyRpgGamesService],
  exports: [GamesService, EasyRpgGamesService],
})
export class GamesModule {}
