import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  description: string;
}
