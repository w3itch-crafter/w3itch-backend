import { Account } from '../../../entities/Account.entity';
import { User } from '../../../entities/User.entity';

export type LoginPlatforms = 'metamask' | 'github' | 'discord';

export interface LoginResult {
  user: User;
  account: Account;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
