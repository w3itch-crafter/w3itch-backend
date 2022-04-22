import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

import { Game } from '../../../entities/Game.entity';
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
  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 60, { each: true })
  @Matches(/^[a-z\d\-]+$/, {
    each: true,
    message:
      'tags name should contain only lowercase letters, numbers and dashes (-)',
  })
  tags: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices?: CreatePriceDto[];
}
