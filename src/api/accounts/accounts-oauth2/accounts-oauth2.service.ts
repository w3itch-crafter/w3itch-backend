import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as randomstring from 'randomstring';

import { AuthenticationService } from '../../../auth/service';
import { AppCacheService } from '../../../cache/service';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { AuthorizeRequestParam, JwtTokens, LoginPlatforms } from '../types';
import {
  AccountsOAuth2AuthorizeCallbacResultDto,
  AccountsOAuth2Method,
} from './dto/accounts-oauth2-redirect.dto';
import { AuthorizeRequestSubjectDto } from './dto/authorize-request-subject.dto';

@Injectable()
export class AccountsOAuth2Service {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly authService: AuthenticationService,

    private readonly cacheService: AppCacheService,
    private readonly configService: ConfigService,
  ) {}

  async buildAuthorizeRequestState(
    redirectUrl: URL,
    param: AuthorizeRequestParam,
    platform: LoginPlatforms,
  ): Promise<string> {
    // OAuth2 uses a state token to prevent CSRF attacks
    // we use this as authorizeRequestSubject key
    const state = this.generateState();
    redirectUrl.pathname = param.redirectUri;

    const ttl = this.configService.get<number>('cache.vcode.ttl');
    // redirectUrl would be a string when authorize request subject is get from cache even if it's type is URL
    await this.cacheService.set<AuthorizeRequestSubjectDto>(
      this.getAuthorizeReqeustSubjectKey(platform, state),
      {
        redirectUrl: redirectUrl.toString(),
        param,
      },
      ttl,
    );

    return state;
  }

  getAuthorizeReqeustSubjectKey(platform: string, state: string): string {
    return `${platform}_authorize_request_state_${state}`;
  }

  generateState(): string {
    return randomstring.generate();
  }

  async getAuthorizeRequestSubjectByState(
    platform: LoginPlatforms,
    state: string,
  ): Promise<AuthorizeRequestSubjectDto> {
    return await this.cacheService.get<AuthorizeRequestSubjectDto>(
      this.getAuthorizeReqeustSubjectKey(platform, state),
    );
  }

  async delAuthorizeRequestSubjectByState(
    platform: LoginPlatforms,
    state: string,
  ): Promise<void> {
    await this.cacheService.del(
      this.getAuthorizeReqeustSubjectKey(platform, state),
    );
  }

  async handleAuthorizeCallback(
    param: AuthorizeRequestParam,
    platform: LoginPlatforms,
    platformUsername: string,
  ): Promise<{
    params: Record<string, string>;
    method?: AccountsOAuth2Method;
    loginTokens?: JwtTokens;
    authorizeCallbackSignupToken?: string;
  }> {
    //remove cached authorize request subject

    if ('bind' === param.type) {
      return await this.bindOAuth2Callback(
        param.userId,
        platform,
        platformUsername,
      );
    } else if ('login' === param.type) {
      try {
        const { user, userAccount } =
          await this.accountsService.getUserAndAccount({
            platform,

            accountId: platformUsername,
          });
        if (user && userAccount) {
          const loginTokens = await this.authService.signLoginJWT(
            user,
            userAccount,
          );
          return {
            method: 'login',
            params: {
              success: 'true',
              code: '200',
            },
            loginTokens,
          };
        } else {
          // sign up first.Ask user to submit username

          const oauth2LoginToken =
            await this.authService.signAuthorizeCallbackSignupJWT(
              platform,
              platformUsername,
            );
          return {
            method: 'authorize_callback_signup',
            params: {
              success: 'true',
              code: '200',
            },
            authorizeCallbackSignupToken: oauth2LoginToken,
          };
        }
      } catch (error) {
        this.logger.verbose(
          `Failed to login with ${platform}: ${error.message}`,
        );
        return {
          params: {
            success: 'false',
            code: '401',
          },
        };
      }
    } else {
      try {
        const loginTokens = (
          await this.accountsService.signup(
            {
              account: platformUsername,
              username: param.username,
            },
            platform,
          )
        ).tokens;
        return {
          method: 'signup',
          params: {
            success: 'true',
            code: '200',
          },
          loginTokens,
        };
      } catch (error) {
        this.logger.verbose(
          `Failed to signup with ${platform} ${platformUsername}: ${error.message}`,
        );
        return {
          params: {
            success: 'false',
            code: '400',
          },
        };
      }
    }
  }

  async bindOAuth2Callback(
    userId: number,
    platform: LoginPlatforms,
    platformUsername: string,
  ): Promise<AccountsOAuth2AuthorizeCallbacResultDto> {
    try {
      await this.accountsService.bind(userId, platform, platformUsername);

      return {
        method: 'bind',
        params: {
          success: 'true',
          code: '200',
        },
      };
    } catch (error) {
      this.logger.verbose(`Failed to bind ${platform}: ${error.message}`);
      return {
        params: {
          success: 'false',
          code: '401',
        },
      };
    }
  }
}
