import {
  Body,
  Controller,
  Headers,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JWTAuthGuard } from '../../../auth/guard';
import { VerificationCodeDto } from '../../../cache/dto/verification-code.dto';
import { CurrentUser } from '../../../decorators/user.decorator';
import { UserJWTPayload } from '../../../types';
import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import { LoginResult } from '../types';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsBindMetaMaskDto } from './dto/accounts-bind-metamask.dto';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@ApiTags('Accounts MetaMask')
@Controller('accounts/metamask')
export class AccountsMetamaskController {
  constructor(
    private readonly accountsMetamaskService: AccountsMetamaskService,
    private readonly jwtCookieHelper: JwtCookieHelper,
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
    @Headers() headers: Record<string, string>,

    @Res({ passthrough: true }) response: Response,
    @Body() accountsLoginMetaMaskDto: AccountsLoginMetaMaskDto,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);
    if (accountsLoginMetaMaskDto.redirectUri) {
      redirectUrl.pathname = accountsLoginMetaMaskDto.redirectUri;
    }
    // like OAuth2 authorize callback redirect
    const accountsAuthRedirectDto = await this.accountsMetamaskService.login(
      redirectUrl,
      accountsLoginMetaMaskDto,
    );
    const { loginTokens, authorizeCallbackSignupToken, params } =
      accountsAuthRedirectDto;

    // login / signup /authorize callback signup
    if (loginTokens) {
      await this.jwtCookieHelper.writeJwtCookies(response, loginTokens);
    } else if (authorizeCallbackSignupToken) {
      await this.jwtCookieHelper.writeAuthorizeCallbackSignupCookie(
        response,
        authorizeCallbackSignupToken,
      );
    }
    Object.keys(params).forEach((key) => {
      accountsAuthRedirectDto.redirectUrl.searchParams.append(key, params[key]);
    });
    return accountsAuthRedirectDto.redirectUrl.toString();
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using metamask' })
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() accountsSignupMetaMaskDto: AccountsSignupMetaMaskDto,
  ): Promise<LoginResult> {
    return await this.accountsMetamaskService.signup(accountsSignupMetaMaskDto);
  }

  @Post('bind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Bind Metamask' })
  async bind(
    @Body() dto: AccountsBindMetaMaskDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<void> {
    await this.accountsMetamaskService.bind(user.id, dto);
  }
  @Post('unbind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Unbind Metamask' })
  async unbind(@CurrentUser() user: UserJWTPayload): Promise<void> {
    await this.accountsMetamaskService.unbind(user.id);
  }
}
