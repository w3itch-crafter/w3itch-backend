import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsOAuth2Helper } from './accounts-oauth2.helper';
import { AccountsOAuth2Service } from './accounts-oauth2.service';

@Module({
  imports: [AuthenticationModule, UsersModule, AppCacheModule, AccountsModule],
  providers: [AccountsOAuth2Service, AccountsOAuth2Helper],
  exports: [AccountsOAuth2Service, AccountsOAuth2Helper],
})
export class AccountsOAuth2Module {}
