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
  @Matches(/^[a-z0-9-]+$/)
  @Length(3, 15)
  username: string;
}
