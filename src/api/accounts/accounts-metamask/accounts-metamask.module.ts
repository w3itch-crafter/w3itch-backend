import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsManager } from '../accounts.manager';
import { AccountsModule } from '../accounts.module';
import { AccountsService } from '../accounts.service';
import { AccountsMetamaskController } from './accounts-metamask.controller';
import { AccountsMetamaskService } from './accounts-metamask.service';
import { AccountsLoginMetaMaskDto } from './dto/accounts-login-metamask.dto';
import { AccountsSignupMetaMaskDto } from './dto/accounts-signup-metamask.dto';

@Module({
  imports: [
    HttpModule,
    AuthenticationModule,
    UsersModule,
    AppCacheModule,
    AccountsModule,
  ],
  providers: [
    AccountsMetamaskService,
    {
      provide: AccountsManager,
      useFactory: (
        accountsService: AccountsService,
        accountsMetaMaskService: AccountsMetamaskService,
      ) =>
        new AccountsManager(
          accountsService,
          'metamask',
          (loginDto: AccountsLoginMetaMaskDto) =>
            accountsMetaMaskService.loginVerify(loginDto),
          (signupDto: AccountsSignupMetaMaskDto) =>
            accountsMetaMaskService.signupVerify(signupDto),
        ),
      inject: [AccountsService, AccountsMetamaskService],
    },
  ],
  controllers: [AccountsMetamaskController],
  exports: [AccountsMetamaskService],
})
export class AccountsMetamaskModule {}
