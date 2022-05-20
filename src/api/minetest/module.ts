import { Module } from '@nestjs/common';

import { MineTestController } from './controller';

@Module({
  imports: [],
  controllers: [MineTestController],
})
export class MineTestModule {}
