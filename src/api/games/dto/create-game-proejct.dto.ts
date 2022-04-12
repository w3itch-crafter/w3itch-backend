import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

import { Game } from '../../../entities/Game.entity';
import { GameFileCharset } from '../../../types/enum';

export class CreateGameProjectDto extends OmitType(Game, [
  'id',
  'prices',
  'file',
  'rating',
  'username',
  'tags',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({
    enum: GameFileCharset,
    default: GameFileCharset.UTF8,
    required: false,
  })
  @IsEnum(GameFileCharset)
  @IsOptional()
  charset: GameFileCharset;

  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 60, { each: true })
  @Matches(/^[a-z0-9\-]+$/, { each: true })
  tags: string[];
}
