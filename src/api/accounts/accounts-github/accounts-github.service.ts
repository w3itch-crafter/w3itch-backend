import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Request, Response } from 'express';
import * as randomstring from 'randomstring';

import { AppCacheService } from '../../../cache/service';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { JwtCookieHelper } from '../jwt-cookie-helper.service';
import { JwtTokens } from '../types';
import { AccountsSignupGithubDto } from './dto/accounts-signup-github.dto';

@Injectable()
export class AccountsGithubService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly cacheService: AppCacheService,
    private readonly jwtCookieHelper: JwtCookieHelper,
    private readonly configService: ConfigService,
  ) {}

  async authorizeRequest(
    request: Request,
    signupDto?: AccountsSignupGithubDto,
  ): Promise<string> {
    // GitHub uses a state token to prevent CSRF attacks
    // But here we use stateKey to store the user's username if they sign up
    const stateKeyRand = randomstring.generate();
    const stateValue = signupDto?.username || '_login';
    const ttl = this.configService.get<number>('cache.vcode.ttl');
    await this.cacheService.set(
      `github_authorize_request_state_${stateKeyRand}`,
      stateValue,
      ttl,
    );

    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const origin = new URL(protocol + '://' + request.get('host'));

    origin.pathname = '/accounts/github/authorize-callback';
    origin.searchParams.append('redirect_url', request.headers.origin);

    const result = new URL('https://github.com/login/oauth/authorize');
    result.searchParams.append(
      'client_id',
      this.configService.get<string>('github.clientId'),
    );
    result.searchParams.append('state', stateKeyRand);
    result.searchParams.append('redirect_uri', origin.toString());
    return result.toString();
  }

  async authorizeCallback(
    response: Response,
    authorizeCallbackDto: any,
  ): Promise<void> {
    const stateKey = `github_authorize_request_state_${authorizeCallbackDto.state}`;
    const state = await this.cacheService.get<string>(stateKey);

    if (!state) {
      throw new BadRequestException(
        "The verification state doesn't match our cache.",
      );
    }

    // noinspection ES6MissingAwait
    this.cacheService.del(authorizeCallbackDto.state);

    const fetchTokenForm = {
      client_id: this.configService.get<string>('github.clientId'),
      client_secret: this.configService.get<string>('github.clientSecret'),
      code: authorizeCallbackDto.code,
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

    let loginTokens: JwtTokens;
    const githubUsername = res.data.login;

    if (state === '_login') {
      loginTokens = (
        await this.accountsService.login({ account: githubUsername }, 'github')
      ).tokens;
    } else {
      loginTokens = (
        await this.accountsService.signup(
          { account: githubUsername, username: state },
          'github',
        )
      ).tokens;
    }

    await this.jwtCookieHelper.writeJwtCookies(response, loginTokens);
    response.redirect(authorizeCallbackDto.redirect_url);
  }
}
