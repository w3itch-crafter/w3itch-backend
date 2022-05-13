import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class AccountsBindGithubDto {
  @ApiProperty({
    default: '/oauth',
  })
  @Matches(/^\//, {
    message: 'redirectUri should start with /',
  })
  redirectUri: string;
}
