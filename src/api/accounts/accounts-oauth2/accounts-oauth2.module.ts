import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsOAuth2Service } from './accounts-oauth2.service';

@Module({
  imports: [AuthenticationModule, UsersModule, AppCacheModule, AccountsModule],
  providers: [AccountsOAuth2Service],
  exports: [AccountsOAuth2Service],
})
export class AccountsOAuth2Module {}
