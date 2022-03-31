import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Tag extends BaseEntity {
  @PrimaryColumn()
  @Length(2, 60)
  @IsString()
  name: string;

  @PrimaryColumn()
  @Length(2, 60)
  @IsString()
  label: string;

  @Column('text', { default: '' })
  @IsString()
  description: string;

  @ManyToMany(() => Game, (game) => game.tags)
  game: Game;
}
