import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache, CachingConfig } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as randomstring from 'randomstring';

@Injectable()
export class AppCacheService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async generateVerificationCode(
    prefix: string,
    key: string,
    options: { length: number; charset: string; capitalization?: string } = {
      length: 8,
      charset: 'alphanumeric',
      capitalization: 'uppercase',
    },
  ): Promise<string> {
    const savedKey = `${prefix}_${key}`;
    // clear remain saved values
    await this.del(savedKey);

    const code = randomstring.generate(options);
    const ttl = this.configService.get<number>('cache.vcode.ttl');
    await this.set<string>(savedKey, code, ttl);
    return code;
  }

  async getVerificationCode(prefix: string, key: string): Promise<string> {
    return await this.get<string>(`${prefix}_${key}`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    this.logger.verbose(`Get cache key ${key}`, AppCacheService.name);
    try {
      return await this.cacheManager.get(key);
    } catch (err) {
      this.logger.error(
        `Get cache key ${key} error:`,
        err,
        AppCacheService.name,
      );
    }
  }

  async set<T>(key: string, value: T, options?: CachingConfig): Promise<T>;
  async set<T>(key: string, value: T, ttl: number): Promise<T>;
  async set<T>(
    key: string,
    value: T,
    arg?: CachingConfig | number,
  ): Promise<T> {
    try {
      if (typeof arg === 'number') {
        this.logger.debug(
          `Set cache key ${key} ttl ${arg}`,
          AppCacheService.name,
        );
        return await this.cacheManager.set(key, value, { ttl: arg });
      }
      this.logger.debug(
        `Set cache key ${key} with arg ${JSON.stringify(arg)}`,
        AppCacheService.name,
      );
      return await this.cacheManager.set(key, value, arg);
    } catch (err) {
      this.logger.error(
        `Set cache key ${key} error:`,
        err,
        AppCacheService.name,
      );
    }
  }

  async del(key: string): Promise<void> {
    this.logger.verbose(`Delete cache key ${key}`, AppCacheService.name);
    try {
      await this.cacheManager.del(key);
    } catch (err) {
      this.logger.error(
        `Delete cache key ${key} error:`,
        err,
        AppCacheService.name,
      );
    }
  }

  async reset(): Promise<void> {
    this.logger.verbose(`Cache reset`, AppCacheService.name);
    await this.cacheManager.reset();
  }
}
