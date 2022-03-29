import { /* CacheInterceptor, */ CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheConfigService } from '../configs/cache';
import { AppCacheService } from './service';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useClass: CacheConfigService,
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
