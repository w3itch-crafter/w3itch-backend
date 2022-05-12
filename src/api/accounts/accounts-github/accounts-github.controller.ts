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
import { Request, Response } from 'express';

import { JWTAuthGuard } from '../../../auth/guard';
import { CurrentUser } from '../../../decorators/user.decorator';
import { UserJWTPayload } from '../../../types';
import { AccountsGithubService } from './accounts-github.service';
import { AccountsBindGithubDto } from './dto/accounts-bind-github.dto';
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
    @Body() dto: AccountsLoginGithubDto,
  ): Promise<string> {
    return await this.accountsGithubService.authorizeRequest(req, {
      type: 'login',
      redirectUri: dto.redirectUri,
    });
  }

  @Post('signup')
  @ApiOperation({ summary: 'Signup using GitHub' })
  async signup(
    @Req() req: Request,
    @Body() dto: AccountsSignupGithubDto,
  ): Promise<string> {
    return await this.accountsGithubService.authorizeRequest(req, {
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
    @Req() req: Request,
    @Body() dto: AccountsBindGithubDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<string> {
    return await this.accountsGithubService.authorizeRequest(req, {
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
    return await this.accountsGithubService.authorizeCallback(
      response,
      authorizeCallbackDto,
    );
  }
}
