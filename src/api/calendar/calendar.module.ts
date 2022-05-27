import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CacheConfigService } from '../../configs/cache';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useClass: CacheConfigService,
    }),
  ],
  controllers: [CalendarController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class CalendarModule {}
