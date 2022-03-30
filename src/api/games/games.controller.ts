import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Pagination } from 'nestjs-typeorm-paginate';

import { Game } from '../../entities/Game.entity';
import { GamesListSortBy } from '../../types/enum';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly easyRpgGamesService: EasyRpgGamesService) {}

  @Get('/*')
  @ApiOperation({ summary: 'get EasyRPG game resources' })
  async getGames(@Req() req: Request, @Res() res: Response) {
    return this.easyRpgGamesService.getGames(req, res);
  }
}
