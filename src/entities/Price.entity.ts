import { ApiHideProperty } from '@nestjs/swagger';
import { IsInt, IsNumberString, IsPositive } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Game } from './Game.entity';
import { Token } from './Token.entity';

@Entity()
export class Price extends BaseEntity {
  @PrimaryColumn()
  @IsInt()
  @IsPositive()
  chainId: number;

  @Column()
  @IsNumberString()
  amount: string;

  @ApiHideProperty()
  @ManyToOne(() => Game, (game) => game.prices, {
    onDelete: 'CASCADE',
  })
  game: Game;

  @ManyToOne(() => Token, (token) => token.prices, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  token: Token;
}
