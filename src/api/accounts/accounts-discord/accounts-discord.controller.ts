import {
  Body,
  Controller,
  Get,
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
import type { Request, Response } from 'express';

import { JWTAuthGuard } from '../../../auth/guard';
import { CurrentUser } from '../../../decorators/user.decorator';
import { UserJWTPayload } from '../../../types';
import { AccountsDiscordService } from './accounts-discord.service';
import { AccountsBindDiscordDto } from './dto/accounts-bind-discord.dto';
import { AccountsLoginDiscordDto } from './dto/accounts-login-discord.dto';
import { AccountsSignupDiscordDto } from './dto/accounts-signup-discord.dto';

@ApiTags('Accounts Discord')
@Controller('accounts/discord')
export class AccountsDiscordController {
  constructor(private readonly accountService: AccountsDiscordService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login using Discord' })
  async login(
    @Req() req: Request,
    @Body() dto: AccountsLoginDiscordDto,
  ): Promise<string> {
    return await this.accountService.authorizeRequest(req, {
      type: 'login',
      redirectUri: dto.redirectUri,
    });
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using Discord' })
  async signup(
    @Req() req: Request,
    @Body() dto: AccountsSignupDiscordDto,
  ): Promise<string> {
    return await this.accountService.authorizeRequest(req, {
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
    @Req() req: Request,
    @Body() dto: AccountsBindDiscordDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<string> {
    return await this.accountService.authorizeRequest(req, {
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
    await this.accountService.unbind(user.id);
  }

  @Get('authorize-callback')
  @ApiOperation({ summary: 'Authorization callback from Discord' })
  @ApiOkResponse({ description: 'User is authenticated and login successful' })
  async authorizeCallback(
    @Res() response: Response,
    @Query() authorizeCallbackDto: any,
  ): Promise<void> {
    return await this.accountService.authorizeCallback(
      response,
      authorizeCallbackDto,
    );
  }
}
