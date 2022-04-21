import { ApiProperty } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';

export class AccountsSignupGithubDto {
  @ApiProperty({
    default: 'john',
  })
  @Matches(/^[a-z\d-]+$/, {
    message:
      'username should contain only lowercase letters, numbers and dashes (-)',
  })
  @Length(3, 15)
  username: string;
}
