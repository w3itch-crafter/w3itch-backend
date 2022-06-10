import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { PlayerService } from './service';

@ApiTags('Games / EasyRPG')
@Controller('player')
export class PlayerController {
  constructor(private readonly service: PlayerService) {}

  @Get('')
  @Get('/')
  async getPlayerIndex(@Req() req: Request, @Res() res: Response) {
    res.set({
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return this.service.getPlayerIndex(req, res);
  }

  @Get('*')
  async getPlayer(@Req() req: Request, @Res() res: Response) {
    res.set({
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return this.service.getPlayer(req, res);
  }
}
