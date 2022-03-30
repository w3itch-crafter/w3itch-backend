import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AccountsModule } from '../api/accounts/accounts.module';
import { AccountsMetamaskModule } from '../api/accounts/accounts-metamask/accounts-metamask.module';
import { AccountsTokenModule } from '../api/accounts/accounts-token/accounts-token.module';
import { GamesModule } from '../api/games/games.module';
import { PlayerModule } from '../api/player/module';
import { UsersModule } from '../api/users/users.module';
import { AppCacheModule } from '../cache/module';
import { configBuilder } from '../configs';
import { BullConfigService } from '../configs/bull';
import { TypeORMConfigService } from '../configs/typeorm';
import { WinstonConfigService } from '../configs/winston';
import { StoragesModule } from '../api/storages/module';

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useClass: BullConfigService,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AccountsModule,
    AccountsMetamaskModule,
    AccountsTokenModule,
    UsersModule,
    AppCacheModule,
    StoragesModule,
    PlayerModule,
    GamesModule,
  ],
})
export class AppModule {}
