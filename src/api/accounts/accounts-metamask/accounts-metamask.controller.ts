import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { VerificationCodeDto } from '../../../cache/dto/verification-code.dto';
import { Account } from '../../../entities/Account.entity';
import { User } from '../../../entities/User.entity';
import { AccountsManager } from '../accounts.manager';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@ApiTags('Accounts MetaMask')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  constructor(
    private readonly accountsManager: AccountsManager,
    private readonly accountsMetamaskService: AccountsMetamaskService,
    private readonly jwtCookieHelper: JWTCookieHelper,
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

  @Post('signup')
  @ApiOperation({ summary: 'Signup using metamask' })
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsSignupMetaMaskDto: AccountsSignupMetaMaskDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsManager.signup(
      accountsSignupMetaMaskDto,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with metamask' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsMetaMaskDto: AccountsLoginMetaMaskDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsManager.login(
      accountsMetaMaskDto,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }
}
