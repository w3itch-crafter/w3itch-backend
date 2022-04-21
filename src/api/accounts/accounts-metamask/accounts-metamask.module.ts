import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { AppCacheModule } from '../../../cache/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsMetamaskController } from './accounts-metamask.controller';
import { AccountsMetamaskService } from './accounts-metamask.service';

@Module({
  imports: [
    HttpModule,
    AuthenticationModule,
    UsersModule,
    AppCacheModule,
    AccountsModule,
  ],
  providers: [AccountsMetamaskService],
  controllers: [AccountsMetamaskController],
  exports: [AccountsMetamaskService],
})
export class AccountsMetamaskModule {}
