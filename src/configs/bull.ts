import { SharedBullConfigurationFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bull';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}

  async createSharedConfiguration(): Promise<QueueOptions> {
    return {
      redis: {
        host: this.configService.get<string>('redis.host'),
        port: +this.configService.get<number>('redis.port'),
        username: this.configService.get<string>('redis.user'),
        password: this.configService.get<string>('redis.pass'),
      },
      // limiter: { max: 5, duration: 3000, bounceBack: true },
    };
  }
}
