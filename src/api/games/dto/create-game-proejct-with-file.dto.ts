import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { CreateGameProjectDto } from './create-game-proejct.dto';

export class CreateGameProjectWithFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ type: CreateGameProjectDto })
  @ValidateNested()
  @Type(() => CreateGameProjectDto)
  game: CreateGameProjectDto;
}
