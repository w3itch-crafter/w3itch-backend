import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppCacheModule } from '../../../cache/module';
import { AccountsModule } from '../accounts.module';
import { AccountsDiscordController } from './accounts-discord.controller';
import { AccountsDiscordService } from './accounts-discord.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://discord.com/api',
    }),
    AppCacheModule,
    AccountsModule,
  ],
  controllers: [AccountsDiscordController],
  providers: [AccountsDiscordService],
})
export class AccountsDiscordModule {}
