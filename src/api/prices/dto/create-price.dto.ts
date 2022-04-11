import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsInt, IsPositive } from 'class-validator';

export class CreatePriceDto {
  @ApiProperty()
  @IsEthereumAddress()
  tokenAddress: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  amount: number;
}
