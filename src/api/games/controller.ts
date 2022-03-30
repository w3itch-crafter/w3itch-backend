import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
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
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Pagination } from 'nestjs-typeorm-paginate';

import { Game } from '../../entities/Game.entity';
import { GamesListSortBy } from '../../types/enum';
import { Engine } from './enums';
import { GamesLogicService } from './logic.service';
import { GamesQueryService } from './query.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(
    private readonly logicService: GamesLogicService,
    private readonly queryService: GamesQueryService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Query games list' })
  async queryGamesList(
    @Query('tags') tags: string[],
    @Query('sortBy', new DefaultValuePipe(GamesListSortBy.TIME))
    sortBy: GamesListSortBy = GamesListSortBy.TIME,
    @Query('order', new DefaultValuePipe('DESC'))
    order: 'ASC' | 'DESC' = 'DESC',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<Pagination<Game>> {
    return this.queryService.queryGamesList({
      tags,
      sortBy,
      order,
      page,
      limit,
    });
  }

  @Get('/*')
  async getGames(@Req() req: Request, @Res() res: Response) {
    return this.logicService.getGames(req, res);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload game, format: zip' })
  @ApiQuery({
    name: 'game',
    type: 'string',
  })
  @ApiQuery({
    name: 'engine',
    type: 'enum',
    enum: Engine,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGame(
    @UploadedFile() file: Express.Multer.File,
    @Query('game') game: string,
    @Query('engine') engine: Engine,
  ) {
    console.log(game, engine, file);
    if (file?.mimetype !== 'application/zip') {
      throw new BadRequestException(`Invalid mimetype: ${file?.mimetype}`);
    }
    this.logicService.uploadGame(game, engine, file);
  }
}
