import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'cache-manager-ioredis';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      ttl: 10, // 10sec
      store: RedisStore,
      host: this.configService.get<string>('cache.redis.host'),
      port: +this.configService.get<number>('cache.redis.port'),
      username: this.configService.get<string>('cache.redis.user'),
      password: this.configService.get<string>('cache.redis.pass'),
      /**
       * Maybe need for future
       * From package cache-manager-ioredis:
       * CacheManagerIORedis.RedisStoreClusterConfig
       */
      // clusterConfig: {
      //   /**
      //    * type IORedis.ClusterNode[]
      //    */
      //   nodes: [
      //     {
      //       host: this.configService.get<string>('cache.redis.host'),
      //       port: +this.configService.get<number>('cache.redis.port'),
      //     },
      //   ],
      //   /**
      //    * type IORedis.ClusterOptions
      //    */
      //   options: {
      //     redisOptions: {
      //       username: this.configService.get<string>('cache.redis.user'),
      //       password: this.configService.get<string>('cache.redis.pass'),
      //     },
      //   },
      // },
    };
  }
}
