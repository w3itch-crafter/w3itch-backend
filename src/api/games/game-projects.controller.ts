import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Pagination } from 'nestjs-typeorm-paginate';

import { JWTAuthGuard } from '../../auth/guard';
import { ApiGeneralPaginationResponse } from '../../decorators/api-general-pagination-response.decorator';
import { CurrentUser } from '../../decorators/user.decorator';
import { Game } from '../../entities/Game.entity';
import { Tag } from '../../entities/Tag.entity';
import { PostedGameEntity, UserJWTPayload } from '../../types';
import { GamesListSortBy } from '../../types/enum';
import { PaginationResponse } from '../../utils/responseClass';
import { TagsService } from '../tags/tags.service';
import { CreateGameProjectWithFileDto } from './dto/create-game-proejct-with-file.dto';
import { UpdateGameProjectDto } from './dto/update-game-proejct.dto';
import { UpdateGameProjectWithFileDto } from './dto/update-game-proejct-with-file.dto';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesService } from './games.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Games')
@Controller('game-projects')
export class GameProjectsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesService: GamesService,
    private readonly tagsService: TagsService,
    private readonly easyRpgGamesService: EasyRpgGamesService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'paignate game projects' })
  @ApiQuery({
    name: 'username',
    required: false,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    isArray: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'order',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: GamesListSortBy,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiGeneralPaginationResponse(Game)
  async paginateGameProjects(
    @Query('username') username: string,
    @Query('tags') tags: string[],
    @Query('sortBy')
    sortBy: GamesListSortBy = GamesListSortBy.TIME,
    @Query('order')
    order: 'ASC' | 'DESC' = 'ASC',
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
      username,
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
    return this.gamesService.findOne(id);
  }

  @Post('/')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create game project, game file format: zip' })
  @UseInterceptors(FileInterceptor('file'))
  async createGameProject(
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGameProjectWithFileDto,
  ) {
    const { game } = body;
    await this.gamesService.validateGameName(game);

    this.logger.verbose(
      `File: ${file.originalname}, Game: ${JSON.stringify(game)}`,
      this.constructor.name,
    );
    if (file?.mimetype !== 'application/zip') {
      throw new BadRequestException(`Invalid mimetype: ${file?.mimetype}`);
    }

    this.easyRpgGamesService.uploadGame(game.gameName, game.kind, file);
    const tags: Tag[] = await this.tagsService.getOrCreateByNames(game.tags);

    this.logger.verbose(
      `Tags of game: ${game.gameName} are ${JSON.stringify(tags)}`,
      this.constructor.name,
    );

    return await this.gamesService.save({
      ...game,
      tags,
      username: user.username,
      file: file.originalname,
    });
  }

  @Patch('/:id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update game project, game file format: zip' })
  @UseInterceptors(FileInterceptor('file'))
  async updateGameProject(
    @Param('id') id: number,
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateGameProjectWithFileDto,
  ) {
    const { game } = body;
    const target = await this.gamesService.findOne(id);

    if (user.username !== target.username) {
      throw new ForbiddenException(
        "You don't have permission to update this project",
      );
    }

    if (game.gameName && game.gameName !== target.gameName) {
      await this.gamesService.validateGameName(game);
    }

    if (file) {
      this.logger.verbose(
        `File: ${file.originalname}, Game: ${JSON.stringify(game)}`,
        this.constructor.name,
      );
      if (file?.mimetype !== 'application/zip') {
        throw new BadRequestException(`Invalid mimetype: ${file?.mimetype}`);
      }
      this.easyRpgGamesService.uploadGame(game.gameName, game.kind, file);
    } else {
      this.logger.verbose(
        `Update game: ${game} with no file uploaded`,
        this.constructor.name,
      );
    }

    const tags: Tag[] = await this.tagsService.getOrCreateByNames(game.tags);
    this.logger.verbose(
      `Tags of game: ${game.gameName} are ${tags}`,
      this.constructor.name,
    );

    const entityToUpdate: Partial<PostedGameEntity> = { ...game, tags };
    if (file) {
      entityToUpdate.file = file.originalname;
    }

    return await this.gamesService.update(id, entityToUpdate);
  }

  @Post('/validate')
  @ApiOperation({
    summary: 'Validate a Game DTO which is to create a game project',
  })
  async validate(@Body() body: UpdateGameProjectDto) {
    await this.gamesService.validateGameName(body);
  }

  @Delete('/:id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Delete the game project and the file directory associated',
  })
  async deleteGameProject(
    @Param('id') id: number,
    @CurrentUser() user: UserJWTPayload,
  ) {
    const target = await this.gamesService.findOne(id);

    if (user.username !== target.username) {
      throw new ForbiddenException(
        "You don't have permission to delete this project",
      );
    }

    this.easyRpgGamesService.deleteGameDirectory(target.file);
    await this.gamesService.delete(id);
  }

  @Delete('/:id/file')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete the file directory of the game project' })
  async deleteGameProjectFiles(
    @Param('id') id: number,
    @CurrentUser() user: UserJWTPayload,
  ) {
    const target = await this.gamesService.findOne(id);

    if (user.username !== target.username) {
      throw new ForbiddenException(
        "You don't have permission to delete the files of this project",
      );
    }

    this.easyRpgGamesService.deleteGameDirectory(target.file);
    await this.gamesService.update(id, { file: null });
  }
}
