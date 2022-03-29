import { AccountsService } from './accounts.service';
import { AccountsVerifier } from './accounts.verifier';
import { Platforms } from './type';

export class AccountsManager {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly platform: Platforms,
    private readonly verify: AccountsVerifier,
  ) {}

  async signup(accountDto: any) {
    return await this.accountsService.signup(
      accountDto,
      this.platform,
      this.verify,
    );
  }

  async login(accountDto: any) {
    return await this.accountsService.login(
      accountDto,
      this.platform,
      this.verify,
    );
  }
}
