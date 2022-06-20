import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { AccountsAuthRedirectDto } from './dto/accounts-auth-redirect.dto';
import { JwtCookieHelper } from './jwt-cookie-helper.service';

@Injectable()
export class AccountsAuthHelper {
  constructor(private readonly jwtCookieHelper: JwtCookieHelper) {}
  async handleAuthorizeCallbackResponse(
    response: Response,
    accountsAuthRedirectDto: AccountsAuthRedirectDto,
  ) {
    const { loginTokens, authorizeCallbackSignupToken } =
      accountsAuthRedirectDto;

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
    return this.redirectWithParams(response, accountsAuthRedirectDto);
  }

  redirectWithParams(
    response: Response,
    accountsOAuth2RedirectDto: AccountsAuthRedirectDto,
  ): void {
    const { redirectUrl, params } = accountsOAuth2RedirectDto;
    Object.keys(params).forEach((key) => {
      redirectUrl.searchParams.append(key, params[key]);
    });
    response.redirect(redirectUrl.toString());
  }
}
