import { Account } from '../../../entities/Account.entity';
import { User } from '../../../entities/User.entity';

export type LoginPlatforms = 'metamask' | 'github' | 'discord';
export type AuthorizeRequestType = 'signup' | 'login' | 'bind';

export interface LoginResult {
  user: User;
  account: Account;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

type BaseAtuorizeRequest = {
  type: AuthorizeRequestType;
  redirectUri: string;
};

type AuthorizeSignupRequest = BaseAtuorizeRequest & {
  type: 'signup';
  username: string;
};
type AuthorizeLoginRequest = BaseAtuorizeRequest & {
  type: 'login';
};
type AuthorizeBindRequest = BaseAtuorizeRequest & {
  type: 'bind';
  userId: number;
};
export type AuthorizeRequestParam =
  | AuthorizeSignupRequest
  | AuthorizeLoginRequest
  | AuthorizeBindRequest;
