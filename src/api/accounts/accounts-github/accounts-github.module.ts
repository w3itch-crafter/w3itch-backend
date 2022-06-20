import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsOAuth2Module } from '../accounts-oauth2/accounts-oauth2.module';
import { AccountsGithubController } from './accounts-github.controller';
import { AccountsGithubService } from './accounts-github.service';

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    AppCacheModule,
    AccountsModule,
    AccountsOAuth2Module,
  ],
  providers: [AccountsGithubService],
  controllers: [AccountsGithubController],
  exports: [AccountsGithubService],
})
export class AccountsGithubModule {}
