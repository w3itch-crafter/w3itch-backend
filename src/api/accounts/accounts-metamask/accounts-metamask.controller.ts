import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { VerificationCodeDto } from '../../../cache/dto/verification-code.dto';
import { LoginResult } from '../types';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@ApiTags('Accounts MetaMask')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  constructor(
    private readonly accountsMetamaskService: AccountsMetamaskService,
  ) {}

  @Post('/verification-code')
  @ApiOperation({
    summary: 'Request a verification code to login with MetaMask',
  })
  async generateVerificationCodeForMetaMask(
    @Body() verifyCode: VerificationCodeDto,
  ): Promise<{ code }> {
    const code = await this.accountsMetamaskService.generateMetamaskNonce(
      verifyCode.key,
    );
    return { code };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with metamask' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsLoginMetaMaskDto: AccountsLoginMetaMaskDto,
  ): Promise<LoginResult> {
    return await this.accountsMetamaskService.login(
      res,
      accountsLoginMetaMaskDto,
    );
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using metamask' })
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsSignupMetaMaskDto: AccountsSignupMetaMaskDto,
  ): Promise<LoginResult> {
    return await this.accountsMetamaskService.signup(
      res,
      accountsSignupMetaMaskDto,
    );
  }
}
