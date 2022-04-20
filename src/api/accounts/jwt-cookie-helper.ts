import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import ms from 'ms';

import { LoginTokens } from '../../types';

@Injectable()
export class JWTCookieHelper {
  constructor(private configService: ConfigService) {}

  private getCookiesOptions(name: string): Partial<CookieOptions> {
    return {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      path: this.configService.get<string>(`cookies.${name}TokenPath`),
    };
  }

  private accessTokenName = this.configService.get<string>(
    'jwt.accessTokenName',
  );
  private refreshTokenName = this.configService.get<string>(
    'jwt.refreshTokenName',
  );

  async JWTCookieWriter(res: Response, tokens: LoginTokens) {
    res.cookie(this.accessTokenName, tokens.accessToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('jwt.accessTokenExpires')),
      ),
      ...this.getCookiesOptions('access'),
    });

    res.cookie(this.refreshTokenName, tokens.refreshToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('jwt.refreshTokenExpires')),
      ),
      ...this.getCookiesOptions('refresh'),
    });
  }

  async JWTCookieDeleter(res: Response) {
    res.clearCookie(this.accessTokenName, this.getCookiesOptions('access'));
    res.clearCookie(this.refreshTokenName, this.getCookiesOptions('refresh'));
  }
}
