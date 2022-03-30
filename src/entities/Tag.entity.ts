import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Column, Entity, ManyToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Tag extends BaseEntity {
  @Column('text', { comment: 'Name of the tag' })
  @Length(2, 60)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ManyToMany(() => Game, (game) => game.tags)
  game: Game;
}
