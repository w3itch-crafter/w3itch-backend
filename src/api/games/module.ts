import { Module } from '@nestjs/common';

import { GamesController } from './controller';
import { GamesService } from './service';

@Module({
  imports: [],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
