import {
  Controller,
  Delete,
  Patch,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { User } from '../../../entities/User.entity';
import { UserJWTPayload } from '../../../types';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsTokenService } from './accounts-token.service';

@ApiTags('Accounts Token')
@Controller('accounts/tokens')
export class AccountsTokenController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loginService: AccountsTokenService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Refresh the access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    const refreshTokenName = this.configService.get<string>(
      'jwt.refreshTokenName',
    );
    const token = req.cookies[refreshTokenName];
    if (!token) {
      throw new UnauthorizedException(
        'Failed to refresh token; You must login.',
      );
    }
    let payload: UserJWTPayload;
    try {
      payload = await this.jwtService.verify(token);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(
        'Failed to refresh token; You must login.',
      );
    }
    const { user, tokens } = await this.loginService.refresh(
      payload.sub,
      payload.account.id,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return user;
  }

  @Delete()
  @ApiOperation({ summary: 'Delete the tokens (logout)' })
  async delete(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.jwtCookieHelper.JWTCookieDeleter(res);
  }
}
