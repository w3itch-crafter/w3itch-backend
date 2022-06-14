import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, Length, Matches } from 'class-validator';

export class AccountsLoginMetaMaskDto {
  @ApiProperty({
    default: '0x1234567890',
  })
  @Length(42, 42)
  @IsEthereumAddress()
  account: string;

  @ApiProperty({
    default: '0x1234567890',
  })
  @Length(132, 132)
  signature: string;

  @ApiProperty({
    default: '/oauth',
  })
  @Matches(/^\//, {
    message: 'redirectUri should start with /',
  })
  redirectUri: string;
}
