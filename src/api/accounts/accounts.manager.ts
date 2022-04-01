import { AccountsService } from './accounts.service';
import {
  AccountsLoginVerifier,
  AccountsSignupVerifier,
} from './accounts.verifier';
import { Platforms } from './type';

export class AccountsManager {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly platform: Platforms,
    private readonly loginVerify: AccountsLoginVerifier,
    private readonly signupVerify: AccountsSignupVerifier,
  ) {}

  async signup(accountSignupDto: any) {
    return await this.accountsService.signup(
      accountSignupDto,
      this.platform,
      this.signupVerify,
    );
  }

  async login(accountDto: any) {
    return await this.accountsService.login(
      accountDto,
      this.platform,
      this.loginVerify,
    );
  }
}
