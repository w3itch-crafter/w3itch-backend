import { Module } from '@nestjs/common';

import { StoragesController } from './controller';
import { StoragesService } from './service';

@Module({
  controllers: [StoragesController],
  providers: [StoragesService],
  exports: [StoragesService],
})
export class StoragesModule {}
