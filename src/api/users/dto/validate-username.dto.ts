import { ApiPropertyOptional } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';

export class ValidateUsernameDto {
  @ApiPropertyOptional({
    default: 'john',
  })
  @Length(3, 15)
  @Matches(/^[a-z\d-]+$/, {
    message:
      'username should contain only lowercase letters, numbers and dashes (-)',
  })
  username: string;
}
