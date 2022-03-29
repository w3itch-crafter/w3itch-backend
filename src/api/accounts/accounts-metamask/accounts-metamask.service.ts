import { BadRequestException, Injectable } from '@nestjs/common';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import { AppCacheService } from '../../../cache/service';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';

@Injectable()
export class AccountsMetamaskService {
  constructor(private readonly cacheService: AppCacheService) {}

  async generateMetamaskNonce(address: string): Promise<string> {
    return await this.cacheService.generateVerificationCode(
      'metamask-login',
      address,
    );
  }

  async verify(accountsMetaMaskDto: AccountsMetaMaskDto): Promise<void> {
    const nonce = await this.cacheService.getVerificationCode(
      'metamask-login',
      accountsMetaMaskDto.account,
    );

    if (nonce === null) {
      throw new BadRequestException('Invalid verification code.');
    }

    const message = `\x19Ethereum Signed Message:\n Code Length: ${nonce.length}; Code: ${nonce}`;

    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: accountsMetaMaskDto.signature,
    });

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    const isSignatureVerified =
      address.toLowerCase() === accountsMetaMaskDto.account.toLowerCase();

    if (!isSignatureVerified) {
      throw new BadRequestException('MetaMask authentication is not verified.');
    }
  }
}
