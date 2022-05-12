import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as randomstring from 'randomstring';

import { AppCacheService } from '../../../cache/service';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import { AuthorizeRequestParam, JwtTokens } from '../types';

@Injectable()
export class AccountsGithubService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly cacheService: AppCacheService,
    private readonly jwtCookieHelper: JwtCookieHelper,
    private readonly configService: ConfigService,
  ) {}

  private redirectWithParams(
    response: Response,
    url: URL,
    params: Record<string, string>,
  ): void {
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });
    response.redirect(url.toString());
  }

  async authorizeRequest(
    request: Request,
    param: AuthorizeRequestParam,
  ): Promise<string> {
    // GitHub uses a state token to prevent CSRF attacks
    // But here we use stateKey to store the user's username if they sign up
    const stateKeyRand = randomstring.generate();
    const stateValue = (param: AuthorizeRequestParam) => {
      if (param.type === 'login') return '_login';
      if (param.type === 'bind') return `_bind:${param.userId}`;
      return param.username;
    };
    const ttl = this.configService.get<number>('cache.vcode.ttl');
    await this.cacheService.set(
      `github_authorize_request_state_${stateKeyRand}`,
      stateValue(param),
      ttl,
    );
    const redirectUrl = new URL(request.headers.origin);
    redirectUrl.pathname = param.redirectUri;

    await this.cacheService.set(
      `github_authorize_request_state_${stateKeyRand}_redirect_url`,
      redirectUrl.toString(),
      ttl,
    );

    const result = new URL('https://github.com/login/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('account.github.clientId'),
    );
    result.searchParams.append('state', stateKeyRand);
    return result.toString();
  }

  async authorizeCallback(
    response: Response,
    authorizeCallbackDto: any,
  ): Promise<void> {
    const stateKey = `github_authorize_request_state_${authorizeCallbackDto.state}`;
    const redirectUrlKey = `github_authorize_request_state_${authorizeCallbackDto.state}_redirect_url`;
    const state = await this.cacheService.get<string>(stateKey);

    /**
     * Redirect url is the url that the user is redirected to after they authorize the app
     * It has below query params:
     * - code: HTTP status code
     * - success: true if login or signup was successful
     * - method: 'login' or 'signup' - only if the state found
     * - service: 'GitHub' here
     */
    const redirectUrl = new URL(
      await this.cacheService.get<string>(redirectUrlKey),
    );
    redirectUrl.searchParams.append('service', 'GitHub');

    if (!state) {
      // the method is unknown
      return this.redirectWithParams(response, redirectUrl, {
        success: 'false',
        code: '400',
      });
    }

    // noinspection ES6MissingAwait
    this.cacheService.del(stateKey);
    // noinspection ES6MissingAwait
    this.cacheService.del(redirectUrlKey);

    const fetchTokenForm = {
      client_id: this.configService.get<string>('account.github.clientId'),
      client_secret: this.configService.get<string>(
        'account.github.clientSecret',
      ),
      code: authorizeCallbackDto.code,
    };

    let githubUsername: string;

    try {
      const fetchTokenResponse = (
        await axios.post(
          'https://github.com/login/oauth/access_token',
          fetchTokenForm,
          {
            headers: { Accept: 'application/json' },
          },
        )
      ).data;

      const res = await axios.get<{ login: string }>(
        'https://api.github.com/user',
        {
          method: 'GET',
          headers: {
            Authorization: `token ${fetchTokenResponse.access_token}`,
          },
        },
      );
      githubUsername = res.data.login;
    } catch (error) {
      this.logger.verbose(
        `Failed to fetch github username from github API: ${error.message}`,
      );

      return this.redirectWithParams(response, redirectUrl, {
        success: 'false',
        code: '401',
      });
    }

    let loginTokens: JwtTokens;
    if (state.startsWith('_bind:')) {
      try {
        redirectUrl.searchParams.append('method', 'bind');
        await this.accountsService.bind(
          Number(state.substring(6)),
          'github',
          githubUsername,
        );

        return this.redirectWithParams(response, redirectUrl, {
          success: 'true',
          code: '200',
        });
      } catch (error) {
        this.logger.verbose(`Failed to bind github: ${error.message}`);
        return this.redirectWithParams(response, redirectUrl, {
          success: 'false',
          code: '401',
        });
      }
    } else if (state === '_login') {
      try {
        redirectUrl.searchParams.append('method', 'login');
        loginTokens = (
          await this.accountsService.login(
            { account: githubUsername },
            'github',
          )
        ).tokens;
      } catch (error) {
        this.logger.verbose(`Failed to login with github: ${error.message}`);
        return this.redirectWithParams(response, redirectUrl, {
          success: 'false',
          code: '401',
        });
      }
    } else {
      try {
        redirectUrl.searchParams.append('method', 'signup');
        loginTokens = (
          await this.accountsService.signup(
            { account: githubUsername, username: state },
            'github',
          )
        ).tokens;
      } catch (error) {
        this.logger.verbose(`Failed to signup with github: ${error.message}`);
        return this.redirectWithParams(response, redirectUrl, {
          success: 'false',
          code: '400',
        });
      }
    }
    await this.jwtCookieHelper.writeJwtCookies(response, loginTokens);

    return this.redirectWithParams(response, redirectUrl, {
      success: 'true',
      code: '200',
    });
  }

  async unbind(userId: number) {
    await this.accountsService.unbind(userId, 'github');
  }
}
