import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Rating extends BaseEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiHideProperty()
  @ManyToOne(() => Game, (game) => game.ratings)
  game: Game;

  @Column()
  @Min(100)
  @Max(500)
  rating: number;
}
