import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import type { Response } from 'express';

import { AppCacheService } from '../../../cache/service';
import { LoginResult } from '../../../types';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@Injectable()
export class AccountsMetamaskService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: AppCacheService,
    private readonly accountsService: AccountsService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  async generateMetamaskNonce(address: string): Promise<string> {
    return await this.cacheService.generateVerificationCode(
      'metamask-login',
      address,
    );
  }

  async loginVerify(loginDto: AccountsLoginMetaMaskDto): Promise<void> {
    const nonce = await this.cacheService.getVerificationCode(
      'metamask-login',
      loginDto.account,
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
      sig: loginDto.signature,
    });

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    const isSignatureVerified =
      address.toLowerCase() === loginDto.account.toLowerCase();

    if (!isSignatureVerified) {
      throw new BadRequestException('MetaMask authentication is not verified');
    }
  }

  async signupVerify(signupDto: AccountsSignupMetaMaskDto): Promise<void> {
    await this.loginVerify(signupDto);
    const validation = await this.usersService.validateUsername(
      signupDto.username,
    );
    if (validation.isExists) {
      throw new ConflictException('Username already exists');
    }
  }

  async login(
    res: Response,
    loginDto: AccountsLoginMetaMaskDto,
  ): Promise<LoginResult> {
    await this.loginVerify(loginDto);
    const { user, account, tokens } = await this.accountsService.login(
      loginDto,
      'metamask',
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  async signup(
    res: Response,
    signupDto: AccountsSignupMetaMaskDto,
  ): Promise<LoginResult> {
    await this.signupVerify(signupDto);
    const { user, account, tokens } = await this.accountsService.signup(
      signupDto,
      'metamask',
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }
}
