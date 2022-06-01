import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MinetestWorldPortItem } from '../../types';
import { MinetestGamesService } from './minetest.games.service';

@ApiTags('Games / Minetest')
@Controller('minetest-games')
export class MinetestGamesController {
  constructor(private readonly minetestGamesService: MinetestGamesService) {}

  @Get('/runnings')
  getRunningGameWorldPorts(): MinetestWorldPortItem[] {
    return this.minetestGamesService.getRunningGameWorldPorts();
  }
  @Get('/runnings/:gameWorldName')
  getPortByGameWorldName(
    @Param('gameWorldName') gameWorldName: string,
  ): MinetestWorldPortItem {
    return {
      gameWorldName,
      port: this.minetestGamesService.getPortByGameWorldName(gameWorldName),
    };
  }

  @Post('/restart/:gameWorldName')
  async restartByGameWorldName(
    @Param('gameWorldName') gameWorldName: string,
  ): Promise<MinetestWorldPortItem> {
    return await this.minetestGamesService.restartMinetestServerByGameWorldName(
      gameWorldName,
    );
  }
}
