import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Web3Provider } from '../web3.provider';

@Injectable()
export class AddressValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}
  async transform(value: { chainId: string; address: string }) {
    const { chainId, address } = value;
    let isContract: boolean;

    const web3 = new Web3Provider(this.configService, Number(chainId));
    try {
      isContract = await web3.isContract(address);
    } catch (error) {
      throw new BadRequestException('Address is not a valid Ethereum address');
    }

    if (!isContract) {
      throw new BadRequestException(
        'Address is not a valid contract address, or it is not on this chain',
      );
    }

    return { chainId: Number(chainId), address };
  }
}
