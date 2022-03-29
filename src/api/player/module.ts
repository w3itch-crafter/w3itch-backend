import { Module } from '@nestjs/common';

import { PlayerController } from './controller';
import { PlayerService } from './service';

@Module({
  imports: [],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
