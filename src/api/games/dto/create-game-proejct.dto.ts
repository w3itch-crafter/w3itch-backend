import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

import { Game } from '../../../entities/Game.entity';
import { GameFileCharset } from '../../../types/enum';
import { CreatePriceDto } from '../../prices/dto/create-price.dto';

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
  @Matches(/^[a-z\d\-]+$/, { each: true })
  tags: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices?: CreatePriceDto[];
}
