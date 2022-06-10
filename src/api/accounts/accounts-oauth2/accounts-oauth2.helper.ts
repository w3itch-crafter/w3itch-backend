import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import { AccountsOAuth2RedirectDto } from './dto/accounts-oauth2-redirect.dto';

@Injectable()
export class AccountsOAuth2Helper {
  constructor(private readonly jwtCookieHelper: JwtCookieHelper) {}
  async handleAuthorizeCallbackResponse(
    response: Response,
    accountsOAuth2RedirectDto: AccountsOAuth2RedirectDto,
  ) {
    const { loginTokens, authorizeCallbackSignupToken } =
      accountsOAuth2RedirectDto;

    // login / signup /authorize callback signup
    if (loginTokens) {
      await this.jwtCookieHelper.writeJwtCookies(response, loginTokens);
    } else if (authorizeCallbackSignupToken) {
      await this.jwtCookieHelper.writeAuthorizeCallbackSignupCookie(
        response,
        authorizeCallbackSignupToken,
      );
    }
    // bind
    return this.redirectWithParams(response, accountsOAuth2RedirectDto);
  }

  redirectWithParams(
    response: Response,
    accountsOAuth2RedirectDto: AccountsOAuth2RedirectDto,
  ): void {
    const { redirectUrl, params } = accountsOAuth2RedirectDto;
    Object.keys(params).forEach((key) => {
      redirectUrl.searchParams.append(key, params[key]);
    });
    response.redirect(redirectUrl.toString());
  }
}
