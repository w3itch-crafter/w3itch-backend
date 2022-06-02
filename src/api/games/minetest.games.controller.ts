import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../../auth/guard';

import { CurrentUser } from '../../decorators/user.decorator';
import { MinetestWorldPortItem, UserJWTPayload } from '../../types';
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
  @UseGuards(JWTAuthGuard)
  @Post('/restart/:gameWorldName')
  async restartByGameWorldName(
    @CurrentUser() user: UserJWTPayload,

    @Param('gameWorldName') gameWorldName: string,
  ): Promise<MinetestWorldPortItem> {
    return await this.minetestGamesService.restartMinetestServerByGameWorldName(
      user.username,
      gameWorldName,
    );
  }
}
