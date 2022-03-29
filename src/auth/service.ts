import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import crypto from 'crypto';

import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';
import { UserJWTPayload } from '../types';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signAny(payload: any, options: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }

  async signLoginJWT(user: User, account: Account) {
    const basePayload = {
      sub: user.id,
      bio: user.bio,
      avatar: user.avatar,
      username: user.username,
      nickname: user.nickname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      account,
    };

    const accessToken: Omit<UserJWTPayload, 'id'> = {
      purpose: 'access_token',
      jti: crypto.randomBytes(20).toString('hex'),
      ...basePayload,
    };

    const refreshToken: Omit<UserJWTPayload, 'id'> = {
      purpose: 'refresh_token',
      jti: crypto.randomBytes(20).toString('hex'),
      ...basePayload,
    };

    return {
      accessToken: this.jwtService.sign(accessToken, {
        expiresIn: this.configService.get<string>('jwt.access_token_expires'),
      }),
      refreshToken: this.jwtService.sign(refreshToken, {
        expiresIn: this.configService.get<string>('jwt.refresh_token_expires'),
      }),
    };
  }
}
