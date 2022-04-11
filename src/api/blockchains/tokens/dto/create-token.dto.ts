import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString, IsUppercase } from 'class-validator';

export class CreateTokenDto {
  @ApiProperty()
  @IsEthereumAddress()
  address: string;

  @ApiProperty()
  @IsUppercase()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  chainName: string;
}
