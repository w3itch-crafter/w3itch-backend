import { JwtPayload } from 'jsonwebtoken';

import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';

export interface UserJWTPayload extends JwtPayload, User {
  id: number;
  sub: number;
  purpose: 'access_token' | 'refresh_token' | string;
  account: Account;
}

export interface TransformResponse<T = any> {
  data: T;
  statusCode: number;
  message: string;
}
