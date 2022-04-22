import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty()
  @Length(2, 60)
  @Matches(/^[a-zA-Z\d \-]+$/, {
    message:
      'tag label should contain only letters, numbers, spaces and dashes (-)',
  })
  @IsString()
  label: string;

  @ApiProperty()
  @IsOptional()
  description: string;
}
