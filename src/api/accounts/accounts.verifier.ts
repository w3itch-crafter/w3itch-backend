export interface AccountsLoginVerifier {
  (accountDto: { account: string }): Promise<void>;
}

export interface AccountsSignupVerifier {
  (accountDto: { account: string }): Promise<void>;
}
