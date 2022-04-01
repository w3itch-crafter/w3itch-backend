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
    default: 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png',
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
