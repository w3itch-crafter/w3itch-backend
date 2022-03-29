import { ApiPropertyOptional } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';

export class ValidateUsernameDto {
  @ApiPropertyOptional({
    default: 'john',
  })
  @Length(3, 15)
  @Matches(/^[a-z0-9-]+$/)
  username: string;
}
