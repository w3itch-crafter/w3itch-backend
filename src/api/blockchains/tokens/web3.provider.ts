import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import abi from 'human-standard-token-abi';
import Web3 from 'web3';

const web3Providers = new Map<number, { url: string; token: string }>();
web3Providers.set(4, {
  url: 'https://rinkeby.infura.io/v3/',
  token: 'blockchains.infura.apiToken',
});

export class Web3Provider {
  web3: Web3;

  constructor(
    private readonly configService: ConfigService,
    readonly chainId: number,
  ) {
    if (!web3Providers.get(chainId)) {
      throw new BadRequestException(
        `Web3Provider: chainId ${chainId} is not supported`,
      );
    }
    const provider = web3Providers.get(chainId);
    const token = this.configService.get(provider.token);
    this.web3 = new Web3(new Web3.providers.HttpProvider(provider.url + token));
  }

  public async getTokenInfo(address: string) {
    const tokenContract = new this.web3.eth.Contract(abi, address);

    const [decimals, name, symbol] = await Promise.all([
      tokenContract.methods.decimals().call(),
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
    ]);
    return { decimals: Number(decimals), name, symbol };
  }

  public async isContract(address: string) {
    return (await this.web3.eth.getCode(address)) !== '0x';
  }
}
