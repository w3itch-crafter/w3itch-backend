import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import abi from 'human-standard-token-abi';
import Web3 from 'web3';

import { configBuilder } from '../../../configs';
import { isDevelopment } from '../../../utils';

const logger = new Logger('Web3Provider');

const providers: {
  chainId: number;
  url: string;
  token: string;
}[] = [
  {
    chainId: 1,
    url: 'https://mainnet.infura.io/v3/',
    token: 'blockchain.infura.apiToken',
  },
  {
    chainId: 3,
    url: 'https://ropsten.infura.io/v3/',
    token: 'blockchain.infura.apiToken',
  },
  {
    chainId: 4,
    url: 'https://rinkeby.infura.io/v3/',
    token: 'blockchain.infura.apiToken',
  },
  {
    chainId: 5,
    url: 'https://goerli.infura.io/v3/',
    token: 'blockchain.infura.apiToken',
  },
  {
    chainId: 10,
    url: 'https://mainnet.optimism.io',
    token: '',
  },
  {
    chainId: 42,
    url: 'https://kovan.infura.io/v3/',
    token: 'blockchain.infura.apiToken',
  },
  {
    chainId: 56,
    url: 'https://rpc.ankr.com/bsc/',
    token: '',
  },
  {
    chainId: 137,
    url: 'https://rpc.ankr.com/polygon',
    token: '',
  },
  {
    chainId: 42161,
    url: 'https://rpc.ankr.com/arbitrum',
    token: '',
  },
];

export class Web3Provider {
  web3: Web3;

  constructor(host: string) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(host));
  }

  public async getTokenInfo(address: string) {
    try {
      const tokenContract = new this.web3.eth.Contract(abi, address);

      const [decimals, name, symbol] = await Promise.all([
        tokenContract.methods.decimals().call(),
        tokenContract.methods.name().call(),
        tokenContract.methods.symbol().call(),
      ]);

      return { decimals: Number(decimals), name, symbol };
    } catch (error) {
      logger.error(
        `Failed to process a getTokenInfo request of ${address}. ${error}`,
      );
      throw new BadRequestException(
        `Web3Provider: token ${address} is not supported`,
      );
    }
  }

  public async isContract(address: string) {
    return (await this.web3.eth.getCode(address)) !== '0x';
  }
}

// initialize web3 providers
const configs = new ConfigService(configBuilder());
const supportedChainIds = configs.get<number[]>(
  `blockchain.supportedChainIds.${isDevelopment() ? 'test' : 'prod'}`,
);

const currentProviders = providers.filter((provider) =>
  supportedChainIds.includes(provider.chainId),
);

// delay the logger to make it later than the other logs
setTimeout(
  () => logger.verbose(`Supported chainIds are: ${supportedChainIds}`),
  2000,
);

class ChainMap<K, V> extends Map<K, V> {
  get(chainId: K): V {
    if (!this.has(chainId)) {
      throw new BadRequestException(
        `Web3Provider: chainId ${chainId} is not supported. Supported chain ids are: ${supportedChainIds}`,
      );
    }
    return super.get(chainId);
  }
}

export const web3Providers = new ChainMap<number, Web3Provider>();

currentProviders.forEach((provider) => {
  const token = provider.token ? configs.get(provider.token) : provider.token;
  const host = provider.url + token;
  web3Providers.set(provider.chainId, new Web3Provider(host));
});
