import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AccountsModule } from '../api/accounts/accounts.module';
import { AccountsMetamaskModule } from '../api/accounts/accounts-metamask/accounts-metamask.module';
import { AccountsTokenModule } from '../api/accounts/accounts-token/accounts-token.module';
import { GamesModule } from '../api/games/games.module';
import { PlayerModule } from '../api/player/module';
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
    AccountsMetamaskModule,
    AccountsTokenModule,
    UsersModule,
    AppCacheModule,
    StoragesModule,
    RatingsModule,
    PlayerModule,
    GamesModule,
  ],
})
export class AppModule {}
