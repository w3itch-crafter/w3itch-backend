import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AccountsGithubService } from './accounts-github.service';
import { AccountsLoginGithubDto } from './dto/accounts-login-github.dto';
import { AccountsSignupGithubDto } from './dto/accounts-signup-github.dto';

@ApiTags('Accounts Github')
@Controller('accounts/github')
export class AccountsGithubController {
  constructor(private readonly accountsGithubService: AccountsGithubService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login using GitHub' })
  async login(
    @Req() req: Request,
    @Body() githubLoginDto: AccountsLoginGithubDto,
  ): Promise<string> {
    return await this.accountsGithubService.authorizeRequest(
      req,
      githubLoginDto,
    );
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using GitHub' })
  async signup(
    @Req() req: Request,
    @Body() githubSignupDto: AccountsSignupGithubDto,
  ): Promise<string> {
    return await this.accountsGithubService.authorizeRequest(
      req,
      githubSignupDto,
    );
  }

  @Get('authorize-callback')
  @ApiOperation({ summary: 'Authorization callback from GitHub' })
  @ApiOkResponse({ description: 'User is authenticated and login successful' })
  async authorizeCallback(
    @Res() response: Response,
    @Query() authorizeCallbackDto: any,
  ): Promise<void> {
    return await this.accountsGithubService.authorizeCallback(
      response,
      authorizeCallbackDto,
    );
  }
}
