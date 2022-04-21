import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, Length, Matches } from 'class-validator';

export class AccountsSignupMetaMaskDto {
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
    default: 'john',
  })
  @Matches(/^[a-z\d-]+$/, {
    message:
      'username should contain only lowercase letters, numbers and dashes (-)',
  })
  @Length(3, 15)
  username: string;
}
