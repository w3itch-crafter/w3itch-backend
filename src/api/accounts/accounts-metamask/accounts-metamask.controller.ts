import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { VerificationCodeDto } from '../../../cache/dto/verification-code.dto';
import { Account } from '../../../entities/Account.entity';
import { User } from '../../../entities/User.entity';
import { AccountsManager } from '../accounts.manager';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsMetaMaskDto } from './dto/accounts-metamask.dto';

@ApiTags('Accounts MetaMask')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  constructor(
    private readonly accountsManager: AccountsManager,
    private readonly accountsMetamaskService: AccountsMetamaskService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}
  @Post('/verification-code')
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
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsManager.signup(
      accountsMetaMaskDto,
    );

    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with metamask' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsMetaMaskDto: AccountsMetaMaskDto,
  ): Promise<{ user: User; account: Account }> {
    const { user, account, tokens } = await this.accountsManager.login(
      accountsMetaMaskDto,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return { user, account };
  }
}
