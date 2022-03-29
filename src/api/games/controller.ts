import {
  BadRequestException,
  Controller,
  Get,
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

import { Engine } from './enums';
import { GamesService } from './service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly service: GamesService) {}

  @Get('*')
  async getGames(@Req() req: Request, @Res() res: Response) {
    return this.service.getGames(req, res);
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
    this.service.uploadGame(game, engine, file);
  }
}
