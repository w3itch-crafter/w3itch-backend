import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
} from 'class-validator';

export class CreatePriceDto {
  @ApiProperty({ default: 4 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  chainId: number;

  @ApiProperty({ default: '0xd94e3DC39d4Cad1DAd634e7eb585A57A19dC7EFE' })
  @IsNotEmpty()
  @IsEthereumAddress()
  token: string;

  @ApiProperty({
    default: '100000000000000000',
    description: 'In Wei, based on the decimals of the Token',
  })
  @IsNotEmpty()
  @IsNumberString()
  amount: string;
}
