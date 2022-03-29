import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  Length,
  MaxLength,
} from 'class-validator';

export class AccountsMetaMaskDto {
  @ApiProperty({
    default: '0x1234567890',
  })
  @MaxLength(42)
  @IsEthereumAddress()
  @IsNotEmpty()
  account: string;

  @Length(132, 132)
  @IsNotEmpty()
  signature: string;
}
