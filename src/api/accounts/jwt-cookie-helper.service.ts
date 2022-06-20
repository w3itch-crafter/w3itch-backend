import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import ms from 'ms';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { JwtTokens } from './types';

@Injectable()
export class JwtCookieHelper {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {}

  private getCookiesOptions(name: string): Partial<CookieOptions> {
    return {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      path: this.configService.get<string>(`auth.cookies.${name}TokenPath`),
    };
  }

  private accessTokenName = this.configService.get<string>(
    'auth.jwt.accessTokenName',
  );
  private refreshTokenName = this.configService.get<string>(
    'auth.jwt.refreshTokenName',
  );
  private authorizeCalllbackSignupTokenName = this.configService.get<string>(
    'auth.jwt.authorizeCalllbackSignupTokenName',
  );

  async writeJwtCookies(res: Response, tokens: JwtTokens) {
    res.cookie(this.accessTokenName, tokens.accessToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('auth.jwt.accessTokenExpires')),
      ),
      ...this.getCookiesOptions('access'),
    });

    res.cookie(this.refreshTokenName, tokens.refreshToken, {
      expires: new Date(
        new Date().getTime() +
          ms(this.configService.get<string>('auth.jwt.refreshTokenExpires')),
      ),
      ...this.getCookiesOptions('refresh'),
    });
  }

  async writeAuthorizeCallbackSignupCookie(res: Response, token: string) {
    res.cookie(this.authorizeCalllbackSignupTokenName, token, {
      expires: new Date(
        new Date().getTime() +
          ms(
            this.configService.get<string>(
              'auth.jwt.authorizeCalllbackSignupTokenExpires',
            ),
          ),
      ),
      ...this.getCookiesOptions('authorizeCallbackSignup'),
    });
  }

  async deleteJwtCookies(res: Response) {
    res.clearCookie(this.accessTokenName, this.getCookiesOptions('access'));
    res.clearCookie(this.refreshTokenName, this.getCookiesOptions('refresh'));
  }

  async getAuthorizeCallbackSignupTokenFromCookie(req: Request) {
    return req.cookies[this.authorizeCalllbackSignupTokenName];
  }

  deleteAuthorizeCallbackSignupTokenFromCookie(res: Response) {
    this.logger.verbose(
      'deleteAuthorizeCallbackSignupTokenFromCookie',
      this.constructor.name,
    );
    res.clearCookie(
      this.authorizeCalllbackSignupTokenName,
      this.getCookiesOptions('authorizeCallbackSignup'),
    );
  }
}
