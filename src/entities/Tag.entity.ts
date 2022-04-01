import { ApiHideProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Column, Entity, ManyToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Tag extends BaseEntity {
  @Column()
  @Length(2, 60)
  @Matches(/^[a-z0-9\-]+$/)
  @IsString()
  name: string;

  @Column()
  @Length(2, 60)
  @Matches(/^[a-zA-Z0-9 \-]+$/)
  @IsString()
  label: string;

  @Column('text', { default: '' })
  @IsString()
  description: string;

  @ApiHideProperty()
  @ManyToMany(() => Game, (game) => game.tags)
  game: Game;
}
