import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MinetestWorld } from '../../../entities/MinetestWorld.entity';
import { MinetestWorldsService } from './minetest-worlds.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinetestWorld])],
  providers: [MinetestWorldsService],
  exports: [MinetestWorldsService],
})
export class MinetestWorldsModule {}
