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

type AuthorizeSignupRequest = {
  type: 'signup';
  username: string;
  redirectUri: string;
};
type AuthorizeLoginRequest = {
  type: 'login';
  redirectUri: string;
};
type AuthorizeBindRequest = {
  type: 'bind';
  userId: number;
  redirectUri: string;
};
export type AuthorizeRequestParam =
  | AuthorizeSignupRequest
  | AuthorizeLoginRequest
  | AuthorizeBindRequest;
