import { AccountsAuthMethod as AccountsAuthMethod, JwtTokens } from '../types';

export class AccountsAuthCallbackResultDto {
  params: Record<string, string>;
  method?: AccountsAuthMethod;
  loginTokens?: JwtTokens;
  authorizeCallbackSignupToken?: string;
}
export class AccountsAuthRedirectDto extends AccountsAuthCallbackResultDto {
  redirectUrl: URL;
}
