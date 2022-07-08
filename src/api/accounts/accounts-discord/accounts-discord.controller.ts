import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { JWTAuthGuard } from '../../../auth/guard';
import { CurrentUser } from '../../../decorators/user.decorator';
import { UserJWTPayload } from '../../../types';
import { AccountsAuthHelper } from '../accounts-auth.helper';
import { AccountsDiscordService } from './accounts-discord.service';
import { AccountsBindDiscordDto } from './dto/accounts-bind-discord.dto';
import { AccountsLoginDiscordDto } from './dto/accounts-login-discord.dto';
import { AccountsSignupDiscordDto } from './dto/accounts-signup-discord.dto';

@ApiTags('Accounts Discord')
@Controller('accounts/discord')
export class AccountsDiscordController {
  constructor(
    private readonly accountsDiscordService: AccountsDiscordService,
    private readonly accountsOAuth2Helper: AccountsAuthHelper,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login using Discord' })
  async login(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsLoginDiscordDto,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);
    return await this.accountsDiscordService.authorizeRequest(redirectUrl, {
      type: 'login',
      redirectUri: dto.redirectUri,
    });
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using Discord' })
  async signup(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsSignupDiscordDto,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);
    return await this.accountsDiscordService.authorizeRequest(redirectUrl, {
      type: 'signup',
      username: dto.username,
      redirectUri: dto.redirectUri,
    });
  }

  @Post('bind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Bind Discord' })
  async bind(
    @Headers() headers: Record<string, string>,
    @Body() dto: AccountsBindDiscordDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<string> {
    const redirectUrl = new URL(headers.origin);

    return await this.accountsDiscordService.authorizeRequest(redirectUrl, {
      type: 'bind',
      userId: user.id,
      redirectUri: dto.redirectUri,
    });
  }
  @Post('unbind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Unbind Discord' })
  async unbind(@CurrentUser() user: UserJWTPayload): Promise<void> {
    await this.accountsDiscordService.unbind(user.id);
  }

  @Get('authorize-callback')
  @ApiOperation({ summary: 'Authorization callback from Discord' })
  @ApiOkResponse({ description: 'User is authenticated and login successful' })
  async authorizeCallback(
    @Res({ passthrough: true }) response: Response,
    @Query() authorizeCallbackDto: any,
  ): Promise<void> {
    const accountsOAuth2RedirectDto =
      await this.accountsDiscordService.authorizeCallback(authorizeCallbackDto);
    return await this.accountsOAuth2Helper.handleAuthorizeCallbackResponse(
      response,
      accountsOAuth2RedirectDto,
    );
  }
}
