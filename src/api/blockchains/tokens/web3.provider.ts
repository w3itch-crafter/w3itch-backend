import { ConfigService } from '@nestjs/config';
import abi from 'human-standard-token-abi';
import Web3 from 'web3';

import { web3Providers } from '../../../constants/web3-providers';

export class Web3Provider {
  web3: Web3;

  constructor(
    private readonly configService: ConfigService,
    readonly chainId: number,
  ) {
    const provider = web3Providers[chainId];
    const token = this.configService.get(provider.token);
    this.web3 = new Web3(new Web3.providers.HttpProvider(provider.url + token));
  }

  public async getTokenInfo(address: string) {
    const tokenContract = new this.web3.eth.Contract(abi, address);

    const [decimals, name, symbol] = await Promise.all([
      Number(tokenContract.methods.decimals().call()),
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
    ]);
    return { decimals, name, symbol };
  }

  public async isContract(address: string) {
    return (await this.web3.eth.getCode(address)) !== '0x';
  }
}
