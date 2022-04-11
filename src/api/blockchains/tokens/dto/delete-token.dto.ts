import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class DeleteTokenDto {
  @ApiProperty()
  @IsEthereumAddress()
  address: string;
}
