import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UpdateGameProjectDto } from './update-game-proejct.dto';

export class UpdateGameProjectWithFileDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;

  @ApiProperty({ type: UpdateGameProjectDto })
  game: UpdateGameProjectDto;
}
