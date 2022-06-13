import { BadRequestException, Injectable } from '@nestjs/common';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import { AppCacheService } from '../../../cache/service';
import { AccountsService } from '../accounts.service';
import { AccountsAuthRedirectDto } from '../dto/accounts-auth-redirect.dto';
import { JwtTokens, LoginResult } from '../types';
import { AccountsBindMetaMaskDto } from './dto/accounts-bind-metamask.dto';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@Injectable()
export class AccountsMetamaskService {
  constructor(
    private readonly cacheService: AppCacheService,
    private readonly accountsService: AccountsService,
  ) {}

  async generateMetamaskNonce(address: string): Promise<string> {
    return await this.cacheService.generateVerificationCode(
      'metamask-login',
      address,
    );
  }

  async verify(
    dto:
      | AccountsLoginMetaMaskDto
      | AccountsSignupMetaMaskDto
      | AccountsBindMetaMaskDto,
  ): Promise<void> {
    const nonce = await this.cacheService.getVerificationCode(
      'metamask-login',
      dto.account,
    );

    if (nonce === null) {
      throw new BadRequestException('Invalid verification code');
    }

    const message = `\x19Ethereum Signed Message:\n Code Length: ${nonce.length}; Code: ${nonce}`;

    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: dto.signature,
    });

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    const isSignatureVerified =
      address.toLowerCase() === dto.account.toLowerCase();

    if (!isSignatureVerified) {
      throw new BadRequestException('MetaMask authentication is not verified');
    }
  }

  async login(
    redirectUrl: URL,
    loginDto: AccountsLoginMetaMaskDto,
  ): Promise<AccountsAuthRedirectDto> {
    await this.verify(loginDto);
    const accounts2AuthorizeCallbacResultDto =
      await this.accountsService.handleAuthorizeCallback(
        { type: 'login' },
        'metamask',
        loginDto.account,
      );
    accounts2AuthorizeCallbacResultDto.method &&
      redirectUrl.searchParams.append(
        'method',
        accounts2AuthorizeCallbacResultDto.method,
      );
    return {
      redirectUrl,
      ...accounts2AuthorizeCallbacResultDto,
    };
  }

  async signup(
    signupDto: AccountsSignupMetaMaskDto,
  ): Promise<LoginResult & { tokens: JwtTokens }> {
    await this.verify(signupDto);
    return await this.accountsService.signup(signupDto, 'metamask');
  }

  async bind(userId: number, dto: AccountsBindMetaMaskDto) {
    await this.verify(dto);
    await this.accountsService.bind(userId, 'metamask', dto.account);
  }
  async unbind(userId: number) {
    await this.accountsService.unbind(userId, 'metamask');
  }
}
