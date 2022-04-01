import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { CreateGameProjectDto } from './create-game-proejct.dto';

// Transforms nested Dto from json to class
const transformGameDto = (gameDto) => {
  try {
    return plainToInstance(CreateGameProjectDto, JSON.parse(gameDto.value));
  } catch (e) {
    throw new BadRequestException(`Body contains invalid JSON `);
  }
};

export class CreateGameProjectWithFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ type: CreateGameProjectDto })
  @Transform(transformGameDto, { toClassOnly: true })
  @ValidateNested()
  @Type(() => CreateGameProjectDto)
  game: CreateGameProjectDto;
}
