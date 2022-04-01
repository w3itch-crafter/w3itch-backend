import { JwtPayload } from 'jsonwebtoken';

import { Account } from '../entities/Account.entity';
import { BaseEntity } from '../entities/base.entity';
import { Game } from '../entities/Game.entity';
import { User } from '../entities/User.entity';

export interface UserJWTPayload extends JwtPayload, User {
  id: number;
  sub: number;
  purpose: 'access_token' | 'refresh_token' | string;
  account: Account;
}

export type PostedGameEntity = Omit<Game, keyof BaseEntity | 'ratings'>;
