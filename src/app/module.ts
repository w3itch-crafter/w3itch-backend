import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AccountsModule } from '../api/accounts/accounts.module';
import { AccountsDiscordModule } from '../api/accounts/accounts-discord/accounts-discord.module';
import { AccountsGithubModule } from '../api/accounts/accounts-github/accounts-github.module';
import { AccountsMetamaskModule } from '../api/accounts/accounts-metamask/accounts-metamask.module';
import { AccountsTokenModule } from '../api/accounts/accounts-token/accounts-token.module';
import { TokensModule } from '../api/blockchains/tokens/tokens.module';
import { CalendarModule } from '../api/calendar/calendar.module';
import { GamesModule } from '../api/games/games.module';
import { MineTestModule } from '../api/minetest/module';
import { PlayerModule } from '../api/player/module';
import { PricesModule } from '../api/prices/prices.module';
import { RatingsModule } from '../api/ratings/ratings.module';
import { StoragesModule } from '../api/storages/module';
import { UsersModule } from '../api/users/users.module';
import { AppCacheModule } from '../cache/module';
import { configBuilder } from '../configs';
import { TypeORMConfigService } from '../configs/typeorm';
import { WinstonConfigService } from '../configs/winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configBuilder],
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useClass: WinstonConfigService,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: TypeORMConfigService,
    }),
    AccountsModule,
    AccountsGithubModule,
    AccountsMetamaskModule,
    AccountsTokenModule,
    AccountsDiscordModule,
    CalendarModule,
    UsersModule,
    AppCacheModule,
    StoragesModule,
    GamesModule,
    PricesModule,
    RatingsModule,
    TokensModule,
    PlayerModule,
    MineTestModule,
  ],
})
export class AppModule {}
