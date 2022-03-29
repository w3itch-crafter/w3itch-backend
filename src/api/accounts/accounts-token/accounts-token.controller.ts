import {
  Controller,
  Delete,
  Patch,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { JwtStrategy } from '../../../auth/strategy';
import { User } from '../../../entities/User.entity';
import { UserJWTPayload } from '../../../types';
import { JWTCookieHelper } from '../jwt-cookie-helper';
import { AccountsTokenService } from './accounts-token.service';

@ApiTags('Accounts Token')
@Controller('accounts/tokens')
export class AccountsTokenController {
  constructor(
    private readonly jwtStrategy: JwtStrategy,
    private readonly configService: ConfigService,
    private readonly loginService: AccountsTokenService,
    private readonly jwtCookieHelper: JWTCookieHelper,
  ) {}

  @Patch()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    const refreshTokenName = this.configService.get<string>(
      'jwt.refresh_token_name',
    );
    const token = req.cookies[refreshTokenName];
    if (!token) {
      throw new UnauthorizedException(
        'Failed to refresh token; You must login.',
      );
    }
    const payload: UserJWTPayload = await this.jwtStrategy.validate(token);
    const { user, tokens } = await this.loginService.refresh(
      payload.sub,
      payload.account.id,
    );
    await this.jwtCookieHelper.JWTCookieWriter(res, tokens);
    return user;
  }

  @Delete()
  async delete(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.jwtCookieHelper.JWTCookieDeleter(res);
  }
}
