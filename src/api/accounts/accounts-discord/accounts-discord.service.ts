import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as randomstring from 'randomstring';
import { firstValueFrom, map, mergeMap } from 'rxjs';

import { AppCacheService } from '../../../cache/service';
import { AccountsService } from '../accounts.service';
import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import type { JwtTokens } from '../types';
import type { AccountsLoginDiscordDto } from './dto/accounts-login-discord.dto';
import type { AccountsSignupDiscordDto } from './dto/accounts-signup-discord.dto';

@Injectable()
export class AccountsDiscordService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly accountsService: AccountsService,
    private readonly cacheService: AppCacheService,
    private readonly jwtCookieHelper: JwtCookieHelper,
    private readonly configService: ConfigService,
    private readonly httpClient: HttpService,
  ) {}

  async authorizeRequest(
    request: Request,
    dto: AccountsSignupDiscordDto | AccountsLoginDiscordDto,
  ): Promise<string> {
    // Discord uses a state token to prevent CSRF attacks
    // But here we use stateKey to store the user's username if they sign up
    const stateKeyRand = randomstring.generate();
    const stateValue = (dto as AccountsSignupDiscordDto).username ?? '_login';
    const ttl = this.configService.get<number>('cache.vcode.ttl');
    await this.cacheService.set(
      `discord_authorize_request_state_${stateKeyRand}`,
      stateValue,
      ttl,
    );

    await this.cacheService.set(
      `discord_authorize_request_state_${stateKeyRand}_redirect_url`,
      new URL(dto.redirectUri, request.headers.origin).toString(),
      ttl,
    );

    const result = new URL('https://discord.com/api/oauth2/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('account.discord.clientId'),
    );
    result.searchParams.append('state', stateKeyRand);
    result.searchParams.append('scope', 'identity');
    result.searchParams.append('response_type', 'code');
    return result.toString();
  }

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

  async authorizeCallback(
    response: Response,
    authorizeCallbackDto: any,
  ): Promise<void> {
    const stateKey = `discord_authorize_request_state_${authorizeCallbackDto.state}`;
    const redirectUrlKey = `discord_authorize_request_state_${authorizeCallbackDto.state}_redirect_url`;
    const state = await this.cacheService.get<string>(stateKey);

    /**
     * Redirect url is the url that the user is redirected to after they authorize the app
     * It has below query params:
     * - code: HTTP status code
     * - success: true if login or signup was successful
     * - method: 'login' or 'signup' - only if the state found
     * - service: 'Discord' here
     */
    const redirectUrl = new URL(
      await this.cacheService.get<string>(redirectUrlKey),
    );
    redirectUrl.searchParams.append('service', 'Discord');

    if (!state) {
      // the method is unknown
      return this.redirectWithParams(response, redirectUrl, {
        success: 'false',
        code: '400',
      });
    }
    redirectUrl.searchParams.append(
      'method',
      state === '_login' ? 'login' : 'signup',
    );

    // noinspection ES6MissingAwait
    this.cacheService.del(stateKey);
    // noinspection ES6MissingAwait
    this.cacheService.del(redirectUrlKey);

    let username: string;

    try {
      const params = new URLSearchParams();
      params.append(
        'client_id',
        this.configService.get<string>('account.discord.clientId'),
      );
      params.append(
        'client_secret',
        this.configService.get<string>('account.discord.clientSecret'),
      );
      params.append('grant_type', 'authorization_code');
      params.append('code', authorizeCallbackDto.code);
      params.append(
        'redirect_uri',
        new URL(
          '/accounts/discord/authorize-callback',
          `${response.req.protocol}://${response.req.hostname}`,
        ).toString(),
      );

      const observable = this.httpClient.post('/oauth2/token', params).pipe(
        mergeMap((response) =>
          this.httpClient.get('/users/@me', {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          }),
        ),
        map((response) => response.data.username),
      );

      username = await firstValueFrom(observable);
    } catch (error) {
      this.logger.verbose(
        `Failed to fetch discord username from discord API: ${error.message}`,
      );

      return this.redirectWithParams(response, redirectUrl, {
        success: 'false',
        code: '401',
      });
    }

    let loginTokens: JwtTokens;
    if (state === '_login') {
      try {
        loginTokens = (
          await this.accountsService.login({ account: username }, 'discord')
        ).tokens;
      } catch (error) {
        this.logger.verbose(`Failed to login with discord: ${error.message}`);
        return this.redirectWithParams(response, redirectUrl, {
          success: 'false',
          code: '401',
        });
      }
    } else
      try {
        {
          redirectUrl.searchParams.append('method', 'signup');
          loginTokens = (
            await this.accountsService.signup(
              { account: username, username: state },
              'discord',
            )
          ).tokens;
        }
      } catch (error) {
        this.logger.verbose(`Failed to signup with discord: ${error.message}`);
        return this.redirectWithParams(response, redirectUrl, {
          success: 'false',
          code: '400',
        });
      }
    await this.jwtCookieHelper.writeJwtCookies(response, loginTokens);

    return this.redirectWithParams(response, redirectUrl, {
      success: 'true',
      code: '200',
    });
  }
}
