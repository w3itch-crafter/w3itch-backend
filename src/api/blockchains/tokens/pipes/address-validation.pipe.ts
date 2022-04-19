import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { web3Providers } from '../web3.provider';

@Injectable()
export class AddressValidationPipe implements PipeTransform {
  async transform(value: { chainId: string; address: string }) {
    const { chainId, address } = {
      chainId: Number(value.chainId),
      address: value.address,
    };

    let isContract: boolean;
    try {
      isContract = await web3Providers.get(chainId).isContract(address);
    } catch (error) {
      throw new BadRequestException('Address is not a valid Ethereum address');
    }

    if (!isContract) {
      throw new BadRequestException(
        'Address is not a valid contract address, or it is not on this chain',
      );
    }

    return { chainId, address };
  }
}
