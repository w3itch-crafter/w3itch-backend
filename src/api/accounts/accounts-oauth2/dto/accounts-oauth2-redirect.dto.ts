import { JwtTokens } from '../../types';

export type AccountsOAuth2Method =
  | 'bind'
  | 'login'
  | 'signup'
  | 'authorize_callback_signup';
export class AccountsOAuth2AuthorizeCallbacResultDto {
  params: Record<string, string>;
  method?: AccountsOAuth2Method;
  loginTokens?: JwtTokens;
  authorizeCallbackSignupToken?: string;
}
export class AccountsOAuth2RedirectDto extends AccountsOAuth2AuthorizeCallbacResultDto {
  redirectUrl: URL;
}
