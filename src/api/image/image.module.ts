import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ImageController } from './image.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('post.preprocessor.urlprefix'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ImageController],
})
export class ImageModule {}
