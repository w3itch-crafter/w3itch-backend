import { ApiProperty } from '@nestjs/swagger';

import { CreateGameProjectDto } from './create-game-proejct.dto';

export class CreateGameProjectWithFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ type: CreateGameProjectDto })
  game: CreateGameProjectDto;
}
