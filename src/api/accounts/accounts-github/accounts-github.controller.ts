import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { JWTAuthGuard } from '../../../auth/guard';
import { CurrentUser } from '../../../decorators/user.decorator';
import { UserJWTPayload } from '../../../types';
import { AccountsOAuth2Helper } from '../accounts-oauth2/accounts-oauth2.helper';
import { AccountsGithubService } from './accounts-github.service';
import { AccountsBindGithubDto } from './dto/accounts-bind-github.dto';
import { AccountsLoginGithubDto } from './dto/accounts-login-github.dto';
import { AccountsSignupGithubDto } from './dto/accounts-signup-github.dto';

@ApiTags('Accounts Github')
@Controller('accounts/github')
export class AccountsGithubController {
  constructor(
    private readonly accountsGithubService: AccountsGithubService,
    private readonly accountsOAuth2Helper: AccountsOAuth2Helper,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login using GitHub' })
  async login(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsLoginGithubDto,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);

    return await this.accountsGithubService.authorizeRequest(redirectUrl, {
      type: 'login',
      redirectUri: dto.redirectUri,
    });
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using GitHub' })
  async signup(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsSignupGithubDto,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);
    return await this.accountsGithubService.authorizeRequest(redirectUrl, {
      type: 'signup',
      username: dto.username,
      redirectUri: dto.redirectUri,
    });
  }

  @Post('bind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Bind GitHub' })
  async bind(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsBindGithubDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);
    return await this.accountsGithubService.authorizeRequest(redirectUrl, {
      type: 'bind',
      userId: user.id,
      redirectUri: dto.redirectUri,
    });
  }
  @Post('unbind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Unbind GitHub' })
  async unbind(@CurrentUser() user: UserJWTPayload): Promise<void> {
    await this.accountsGithubService.unbind(user.id);
  }

  @Get('authorize-callback')
  @ApiOperation({ summary: 'Authorization callback from GitHub' })
  @ApiOkResponse({ description: 'User is authenticated and login successful' })
  async authorizeCallback(
    @Res() response: Response,
    @Query() authorizeCallbackDto: any,
  ): Promise<void> {
    const accountsOAuth2RedirectDto =
      await this.accountsGithubService.authorizeCallback(authorizeCallbackDto);
    return await this.accountsOAuth2Helper.handleAuthorizeCallbackResponse(
      response,
      accountsOAuth2RedirectDto,
    );
  }
}
