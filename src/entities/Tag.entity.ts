import { ApiHideProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Column, Entity, ManyToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';

@Entity()
export class Tag extends BaseEntity {
  @Column()
  @Length(2, 60)
  @Matches(/^[a-z\d\-]+$/, {
    message:
      'tag name should contain only lowercase letters, numbers and dashes (-)',
  })
  @IsString()
  name: string;

  @Column()
  @Length(2, 60)
  @Matches(/^[a-zA-Z\d \-]+$/, {
    message:
      'tag label should contain only letters, numbers, spaces and dashes (-)',
  })
  @IsString()
  label: string;

  @Column('text', { nullable: true })
  @IsString()
  description: string;

  @ApiHideProperty()
  @ManyToMany(() => Game, (game) => game.tags, {
    onDelete: 'CASCADE',
  })
  game: Game;
}
