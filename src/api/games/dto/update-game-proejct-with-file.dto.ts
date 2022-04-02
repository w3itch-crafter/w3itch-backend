import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { UpdateGameProjectDto } from './update-game-proejct.dto';

// Transforms nested Dto from json to class
const transformGameDto = (gameDto) => {
  try {
    return plainToInstance(UpdateGameProjectDto, JSON.parse(gameDto.value));
  } catch (e) {
    throw new BadRequestException(`Body contains invalid JSON `);
  }
};

export class UpdateGameProjectWithFileDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;

  @ApiProperty({ type: UpdateGameProjectDto })
  @Transform(transformGameDto, { toClassOnly: true })
  @ValidateNested()
  @Type(() => UpdateGameProjectDto)
  game: UpdateGameProjectDto;
}
