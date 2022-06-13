import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AccountsService } from '../accounts.service';
import { AccountsOAuth2Service } from '../accounts-oauth2/accounts-oauth2.service';
import { AccountsAuthRedirectDto } from '../dto/accounts-auth-redirect.dto';
import { AuthorizeRequestParam, LoginPlatforms } from '../types';

@Injectable()
export class AccountsGithubService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly accountsService: AccountsService,
    private readonly accountsOAuth2Service: AccountsOAuth2Service,
  ) {}

  async authorizeRequest(
    redirectUrl: URL,
    param: AuthorizeRequestParam,
  ): Promise<string> {
    const result = new URL('https://github.com/login/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('account.github.clientId'),
    );
    // GitHub uses a state token to prevent CSRF attacks
    // But here we use stateKey to store the user's username if they sign up

    const state = await this.accountsOAuth2Service.buildAuthorizeRequestState(
      redirectUrl,
      param,
      this.getPlatform(),
    );
    result.searchParams.append('state', state);
    return result.toString();
  }

  async authorizeCallback(
    authorizeCallbackDto: any,
  ): Promise<AccountsAuthRedirectDto> {
    /**
     * Redirect url is the url that the user is redirected to after they authorize the app
     * It has below query params:
     * - code: HTTP status code
     * - success: true if login or signup was successful
     * - method: 'login' | 'signup' | 'authorize_callback_signup' - only if the state found
     * - service: 'GitHub' here
     */
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
    const redirectUrl = new URL(authorizeRequestSubject.redirectUrl);
    this.logger.verbose(
      `GitHhub redirectUrl ${authorizeRequestSubject.redirectUrl}`,
      this.constructor.name,
    );
    redirectUrl.searchParams.append('service', 'GitHub');

    let githubUsername: string;
    try {
      githubUsername = await this.getPlatformUsername(code);
    } catch (error) {
      this.logger.verbose(
        `Failed to fetch github username from github API: ${error.message}`,
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
      `GitHub code: ${code} state: ${state} username: ${githubUsername}`,
      this.constructor.name,
    );
    if (!githubUsername) {
      return {
        redirectUrl,
        params: {
          success: 'false',
          code: '401',
        },
      };
    }
    await this.accountsOAuth2Service.delAuthorizeRequestSubjectByState(
      'github',
      state,
    );

    const accountsOAuth2AuthorizeCallbacResultDto =
      await this.accountsService.handleAuthorizeCallback(
        authorizeRequestSubject.param,
        this.getPlatform(),
        githubUsername,
      );
    accountsOAuth2AuthorizeCallbacResultDto.method &&
      redirectUrl.searchParams.append(
        'method',
        accountsOAuth2AuthorizeCallbacResultDto.method,
      );
    return {
      redirectUrl,
      ...accountsOAuth2AuthorizeCallbacResultDto,
    };
  }

  getPlatform(): LoginPlatforms {
    return 'github';
  }

  async getPlatformUsername(code: string) {
    const fetchTokenForm = {
      client_id: this.configService.get<string>('account.github.clientId'),
      client_secret: this.configService.get<string>(
        'account.github.clientSecret',
      ),
      code,
    };
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
    return res.data.login;
  }

  async unbind(userId: number) {
    await this.accountsService.unbind(userId, this.getPlatform());
  }
}
