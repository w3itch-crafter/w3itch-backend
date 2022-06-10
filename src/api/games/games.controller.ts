import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { EasyRpgGamesService } from './easy-rpg.games.service';

@ApiTags('Games / EasyRPG')
@Controller('games')
export class GamesController {
  constructor(private readonly easyRpgGamesService: EasyRpgGamesService) {}

  @Get('/*')
  @ApiOperation({ summary: 'get EasyRPG game resources' })
  async getGames(@Req() req: Request, @Res() res: Response) {
    this.corp(res);
    return this.easyRpgGamesService.getGames(req, res);
  }

  private corp(res: Response<any, Record<string, any>>) {
    res.set({
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
  }
}
