import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppCacheModule } from '../../../cache/module';
import { AccountsModule } from '../accounts.module';
import { AccountsOAuth2Module } from '../accounts-oauth2/accounts-oauth2.module';
import { AccountsDiscordController } from './accounts-discord.controller';
import { AccountsDiscordService } from './accounts-discord.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://discord.com/api',
    }),
    AppCacheModule,
    AccountsModule,
    AccountsOAuth2Module,
  ],
  controllers: [AccountsDiscordController],
  providers: [AccountsDiscordService],
})
export class AccountsDiscordModule {}
