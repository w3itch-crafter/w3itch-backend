import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { firstValueFrom, map, mergeMap } from 'rxjs';

import { AccountsService } from '../accounts.service';
import { AccountsOAuth2Service } from '../accounts-oauth2/accounts-oauth2.service';
import { AccountsAuthRedirectDto } from '../dto/accounts-auth-redirect.dto';
import type {
  AuthorizeRequestParam,
  JwtTokens,
  LoginPlatforms,
} from '../types';

@Injectable()
export class AccountsDiscordService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly accountsService: AccountsService,
    private readonly accountsOAuth2Service: AccountsOAuth2Service,

    private readonly configService: ConfigService,
    private readonly httpClient: HttpService,
  ) {}

  async authorizeRequest(
    redirectUrl: URL,
    param: AuthorizeRequestParam,
  ): Promise<string> {
    // Discord uses a state token to prevent CSRF attacks
    // But here we use stateKey to store the user's username if they sign up
    const state = await this.accountsOAuth2Service.buildAuthorizeRequestState(
      redirectUrl,
      param,
      this.getPlatform(),
    );
    const result = new URL('https://discord.com/api/oauth2/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('account.discord.clientId'),
    );
    result.searchParams.append('state', state);
    result.searchParams.append('scope', 'identify');
    result.searchParams.append('response_type', 'code');
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: any,
  ): Promise<AccountsAuthRedirectDto> {
    const { code, state } = authorizeCallbackDto;
    const authorizeRequestSubject =
      await this.accountsOAuth2Service.getAuthorizeRequestSubjectByState(
        this.getPlatform(),
        state,
      );
    // If the state is invalid or expired, we can't get the redirectUrl.
    // It's possible that the request is illegal, and it's acceptable to throw an exception directly without redirecting to the specific front-end.
    if (!authorizeRequestSubject) {
      throw new BadRequestException('Invalid state');
    }

    /**
     * Redirect url is the url that the user is redirected to after they authorize the app
     * It has below query params:
     * - code: HTTP status code
     * - success: true if login or signup was successful
     * - method: 'login' or 'signup' - only if the state found
     * - service: 'Discord' here
     */
    const redirectUrl = new URL(authorizeRequestSubject.redirectUrl);

    redirectUrl.searchParams.append('service', 'Discord');

    await this.accountsOAuth2Service.delAuthorizeRequestSubjectByState(
      'discord',
      state,
    );
    let username: string;

    try {
      username = await this.getPlatformUsername(code);
    } catch (error) {
      this.logger.verbose(
        `Failed to fetch discord username from discord API: ${error.message}`,
      );

      return {
        redirectUrl,

        params: {
          success: 'false',
          code: '401',
        },
      };
    }

    this.logger.verbose(
      `Discord code: ${code} state: ${state} username: ${username}`,
      this.constructor.name,
    );
    if (!username || 'undefined#undefined' === username) {
      return {
        redirectUrl,
        params: {
          success: 'false',
          code: '401',
        },
      };
    }

    const accountsOAuth2AuthorizeCallbacResultDto =
      await this.accountsService.handleAuthorizeCallback(
        authorizeRequestSubject.param,
        this.getPlatform(),
        username,
      );
    accountsOAuth2AuthorizeCallbacResultDto.method &&
      redirectUrl.searchParams.append(
        'method',
        accountsOAuth2AuthorizeCallbacResultDto.method,
      );
    redirectUrl.searchParams.append('state', state);
    return {
      redirectUrl,
      ...accountsOAuth2AuthorizeCallbacResultDto,
    };
  }
  async unbind(userId: number) {
    await this.accountsService.unbind(userId, this.getPlatform());
  }

  getPlatform(): LoginPlatforms {
    return 'discord';
  }

  async getPlatformUsername(code: string) {
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
    params.append('code', code);

    const observable = this.httpClient.post('/oauth2/token', params).pipe(
      mergeMap((response) =>
        this.httpClient.get('/users/@me', {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        }),
      ),
      map(({ data }) => `${data.username}#${data.discriminator}`),
    );

    return await firstValueFrom(observable);
  }
}
