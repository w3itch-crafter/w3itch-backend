import { Injectable } from '@nestjs/common';

import { AuthenticationService } from '../../../auth/service';
import { Account } from '../../../entities/Account.entity';
import { User } from '../../../entities/User.entity';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';

@Injectable()
export class AccountsTokenService {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
  ) {}

  async refresh(uid: number, accountId: number) {
    const user: User = await this.usersService.findOne(uid);
    const account: Account = await this.accountsService.findOne(accountId);
    return { user, tokens: await this.authService.signLoginJWT(user, account) };
  }
}
