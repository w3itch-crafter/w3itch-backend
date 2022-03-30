import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { JWT_KEY } from '../constants';
import { UserJWTPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) =>
        req.cookies[configService.get<string>('jwt.access_token_name')],
      secretOrKey: JWT_KEY.privateKey,
      algorithms: [configService.get<string>('jwt.algorithm')],
    });
  }

  async validate(payload: UserJWTPayload): Promise<UserJWTPayload> {
    const result = {
      id: payload.sub,
      ...payload,
    };
    delete result.sub;
    return result;
  }
}
