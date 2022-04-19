import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import abi from 'human-standard-token-abi';
import Web3 from 'web3';

import { configBuilder } from '../../../configs';

class ChainMap<K, V> extends Map<K, V> {
  get(chainId: K): V {
    if (!this.has(chainId)) {
      throw new BadRequestException(
        `Web3Provider: chainId ${chainId} is not supported`,
      );
    }
    return super.get(chainId);
  }
}

const providers: {
  chainId: number;
  url: string;
  token: string;
}[] = [
  {
    chainId: 4,
    url: 'https://rinkeby.infura.io/v3/',
    token: 'blockchains.infura.apiToken',
  },
  {
    chainId: 56,
    url: 'https://rpc.ankr.com/bsc/',
    token: '',
  },
];

export class Web3Provider {
  web3: Web3;

  constructor(host: string) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(host));
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

export const web3Providers = new ChainMap<number, Web3Provider>();

// initialize web3 providers
const configs = new ConfigService(configBuilder());

providers.forEach((provider) => {
  const token = provider.token ? configs.get(provider.token) : provider.token;
  const host = provider.url + token;
  web3Providers.set(provider.chainId, new Web3Provider(host));
});
