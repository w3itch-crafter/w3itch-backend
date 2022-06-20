import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    default: 'Brendan Eich',
  })
  @Length(1, 32)
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    default:
      'https://image.w3itch.io/w3itch-test/attachment/5/c388baa8-c244-4782-9807-978a8dcb7700.png',
  })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    default: 'some description of this user',
  })
  @Length(1, 200)
  @IsOptional()
  bio?: string;
}
