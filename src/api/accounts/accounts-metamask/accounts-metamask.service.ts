import { BadRequestException, Injectable } from '@nestjs/common';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import type { Response } from 'express';

import { AppCacheService } from '../../../cache/service';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import { LoginResult } from '../types';
import { AccountsBindMetaMaskDto } from './dto/accounts-bind-metamask.dto';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@Injectable()
export class AccountsMetamaskService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: AppCacheService,
    private readonly accountsService: AccountsService,
    private readonly jwtCookieHelper: JwtCookieHelper,
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

  async loginOrSignup(
    action: 'login' | 'signup',
    res: Response,
    dto: AccountsLoginMetaMaskDto | AccountsSignupMetaMaskDto,
  ): Promise<LoginResult> {
    await this.verify(dto);
    const { user, account, tokens } = await this.accountsService[action](
      dto as any,
      'metamask',
    );
    await this.jwtCookieHelper.writeJwtCookies(res, tokens);
    return { user, account };
  }

  async login(
    res: Response,
    loginDto: AccountsLoginMetaMaskDto,
  ): Promise<LoginResult> {
    return await this.loginOrSignup('login', res, loginDto);
  }

  async signup(
    res: Response,
    signupDto: AccountsSignupMetaMaskDto,
  ): Promise<LoginResult> {
    return await this.loginOrSignup('signup', res, signupDto);
  }

  async bind(userId: number, dto: AccountsBindMetaMaskDto) {
    await this.verify(dto);
    await this.accountsService.bind(userId, 'metamask', dto.account);
  }
  async unbind(userId: number) {
    await this.accountsService.unbind(userId, 'metamask');
  }
}
