import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class AccountsLoginDiscordDto {
  @ApiProperty({
    default: '/oauth',
  })
  @Matches(/^\//, {
    message: 'redirectUri should start with /',
  })
  redirectUri: string;
}
