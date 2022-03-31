import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Rating extends BaseEntity {
  @Column()
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ManyToOne(() => Game, (game) => game.ratings)
  game: Game;

  @Column()
  @Min(100)
  @Max(500)
  rating: number;
}
