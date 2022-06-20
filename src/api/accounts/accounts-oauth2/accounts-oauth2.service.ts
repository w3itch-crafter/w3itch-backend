import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as randomstring from 'randomstring';

import { AppCacheService } from '../../../cache/service';
import { AuthorizeRequestParam, JwtTokens, LoginPlatforms } from '../types';
import { AuthorizeRequestSubjectDto } from './dto/authorize-request-subject.dto';

@Injectable()
export class AccountsOAuth2Service {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,

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
    if (param.redirectUri) {
      redirectUrl.pathname = param.redirectUri;
    }

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
}
