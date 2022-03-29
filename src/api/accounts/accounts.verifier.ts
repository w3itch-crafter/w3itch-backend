export interface AccountsVerifier {
  (accountDto: { account: string }): Promise<void>;
}
