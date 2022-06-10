import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { Account } from '../../entities/Account.entity';
import { UserJWTPayload } from '../../types';
import { AccountsService } from './accounts.service';
import { AccountsSignupDto } from './dto/accounts-signup.dto';
import { JwtCookieHelper } from './jwt-cookie-helper.service';
import { LoginResult } from './types';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtCookieHelper: JwtCookieHelper,
  ) {}

  @Get('mine')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  async getMyAccounts(@CurrentUser() user: UserJWTPayload): Promise<Account[]> {
    return await this.accountsService.find({ user: { id: user.id } });
  }

  @Post('authorize-callback-signup')
  @ApiOperation({ summary: 'Signup with authorize callback token' })
  async authorizeCallbackSignup(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() accountsSignupDto: AccountsSignupDto,
  ): Promise<LoginResult> {
    const token =
      await this.jwtCookieHelper.getAuthorizeCallbackSignupTokenFromCookie(
        request,
      );
    const loginResult = await this.accountsService.authorizeCallbackSignup(
      token,
      accountsSignupDto.username,
    );
    await this.jwtCookieHelper.deleteAuthorizeCallbackSignupTokenFromCookie(
      response,
    );
    await this.jwtCookieHelper.writeJwtCookies(response, loginResult.tokens);
    const { user, account } = loginResult;
    return { user, account };
  }
}
