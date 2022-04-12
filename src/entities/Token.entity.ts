import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsInt,
  IsPositive,
  IsString,
  IsUppercase,
} from 'class-validator';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Price } from './Price.entity';

@Entity()
export class Token extends BaseEntity {
  @PrimaryColumn()
  @IsEthereumAddress()
  address: string;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsInt()
  decimals: number;

  @Column()
  @IsUppercase()
  @IsString()
  symbol: string;

  @Column()
  @IsInt()
  chainId: number;

  @ApiHideProperty()
  @OneToMany(() => Price, (price) => price.token, {
    onDelete: 'CASCADE',
  })
  @IsInt()
  @IsPositive()
  prices: Price[];
}
