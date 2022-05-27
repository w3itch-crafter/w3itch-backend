import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MinetestGamesService } from './minetest.games.service';
import { GameWorldPortItem } from './type';

@ApiTags('games')
@Controller('minetest-games')
export class MinetestGamesController {
  constructor(private readonly minetestGamesService: MinetestGamesService) {}

  @Get('/runnings')
  getRunningGameWorldPorts(): GameWorldPortItem[] {
    return this.minetestGamesService.getRunningGameWorldPorts();
  }
  @Get('/runnings/:gameWorldName')
  getPortByGameWorldName(
    @Param('gameWorldName') gameWorldName: string,
  ): GameWorldPortItem {
    return {
      gameWorldName,
      port: this.minetestGamesService.getPortByGameWorldName(gameWorldName),
    };
  }

  @Post('/restart/:gameWorldName')
  async restartByGameWorldName(
    @Param('gameWorldName') gameWorldName: string,
  ): Promise<GameWorldPortItem> {
    return await this.minetestGamesService.restartByGameWorldName(
      gameWorldName,
    );
  }
}
