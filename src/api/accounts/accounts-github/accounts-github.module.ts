import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsGithubController } from './accounts-github.controller';
import { AccountsGithubService } from './accounts-github.service';

@Module({
  imports: [AuthenticationModule, UsersModule, AppCacheModule, AccountsModule],
  providers: [AccountsGithubService],
  controllers: [AccountsGithubController],
  exports: [AccountsGithubService],
})
export class AccountsGithubModule {}
