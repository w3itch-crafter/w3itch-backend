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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Pagination } from 'nestjs-typeorm-paginate';

import { JWTAuthGuard } from '../../auth/guard';
import { ApiGeneralPaginationResponse } from '../../decorators/api-general-pagination-response.decorator';
import { CurrentUser } from '../../decorators/user.decorator';
import { Game } from '../../entities/Game.entity';
import { UserJWTPayload } from '../../types';
import { GamesListSortBy } from '../../types/enum';
import { PaginationResponse } from '../../utils/responseClass';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesService } from './games.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('games')
@Controller('game-projects')
export class GameProjectsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesService: GamesService,
    private readonly easyRpgGamesService: EasyRpgGamesService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'paignate game projects' })
  @ApiGeneralPaginationResponse(Game)
  async paginateGameProjects(
    @Query('tags') tags: string[],
    @Query('sortBy', new DefaultValuePipe(GamesListSortBy.TIME))
    sortBy: GamesListSortBy = GamesListSortBy.TIME,
    @Query('order', new DefaultValuePipe('DESC'))
    order: 'ASC' | 'DESC' = 'DESC',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<Pagination<Game>> {
    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0) {
      limit = 1;
    }
    if (limit > 100) {
      limit = 100;
    }
    return this.gamesService.paginateGameProjects({
      tags,
      sortBy,
      order,
      page,
      limit,
    });
  }
  @Get('/:id(\\d+)')
  @ApiOperation({ summary: 'get game project by id' })
  @ApiOkResponse({ type: Game })
  @ApiNotFoundResponse({ description: 'Game not found' })
  async getGameProjectById(@Param('id') id: number) {
    return this.gamesService.getGameProjectById(id);
  }

  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create game project, game file format: zip' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        game: {
          $ref: getSchemaPath(Game),
        },
      },
    },
  })
  @Post('/')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createGameProject(
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    const game = JSON.parse(body.game) as Game;
    game.userId = user.id;
    game.file = file.originalname;
    this.logger.verbose(
      `File: ${file.originalname}, Game: ${game}`,
      this.constructor.name,
    );
    if (file?.mimetype !== 'application/zip') {
      throw new BadRequestException(`Invalid mimetype: ${file?.mimetype}`);
    }
    //TODO gameName must be unique
    this.easyRpgGamesService.uploadGame(game.gameName, game.kind, file);
    return await this.gamesService.save(game);
  }
}
