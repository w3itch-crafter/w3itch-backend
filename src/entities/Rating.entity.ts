import { ApiHideProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity()
export class Rating extends BaseEntity {
  @ApiHideProperty()
  @Column()
  @IsInt()
  gameId: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsInt()
  @Min(100)
  @Max(500)
  rating: number;
}
