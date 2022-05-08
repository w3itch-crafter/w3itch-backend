import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AccountsDiscordService } from './accounts-discord.service';
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
    @Body() loginDto: AccountsLoginDiscordDto,
  ): Promise<string> {
    return await this.accountService.authorizeRequest(req, loginDto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using Discord' })
  async signup(
    @Req() req: Request,
    @Body() signupDto: AccountsSignupDiscordDto,
  ): Promise<string> {
    return await this.accountService.authorizeRequest(req, signupDto);
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
