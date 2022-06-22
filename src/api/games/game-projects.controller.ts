import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  LoggerService,
  Param,
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
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

import { JWTAuthGuard } from '../../auth/guard';
import { ApiGeneralPaginationResponse } from '../../decorators/api-general-pagination-response.decorator';
import { CurrentUser } from '../../decorators/user.decorator';
import { Game } from '../../entities/Game.entity';
import { UserJWTPayload } from '../../types';
import {
  GameEngine,
  GamesListSortBy,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../../types/enum';
import { PaginationResponse } from '../../utils/responseClass';
import { ValidateUsernameDto } from '../users/dto/validate-username.dto';
import { CreateGameProjectWithFileDto } from './dto/create-game-proejct-with-file.dto';
import { UpdateGameProjectWithFileDto } from './dto/update-game-proejct-with-file.dto';
import { ValidateGameProjectDto } from './dto/validate-game-proejct.dto';
import { GamesBaseService } from './games.base.service';
import { GamesLogicService } from './games.logic.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Game Projects')
@Controller('game-projects')
export class GameProjectsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesLogicService: GamesLogicService,
    private readonly gamesBaseService: GamesBaseService
  ) { }

  @Get('/')
  @ApiOperation({ summary: 'paignate game projects' })
  @ApiQuery({
    name: 'username',
    required: false,
  })
  @ApiQuery({
    name: 'paymentMode',
    enum: PaymentMode,
    required: false,
  })
  @ApiQuery({
    name: 'classification',
    enum: ProjectClassification,
    required: false,
  })
  @ApiQuery({
    name: 'kind',
    enum: GameEngine,
    required: false,
  })
  @ApiQuery({
    name: 'genre',
    enum: Genre,
    required: false,
  })
  @ApiQuery({
    name: 'releaseStatus',
    enum: ReleaseStatus,
    required: false,
  })
  @ApiQuery({
    name: 'donationAddress',
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
    @Query('paymentMode') paymentMode: PaymentMode,
    @Query('classification') classification: ProjectClassification,
    @Query('kind') kind: GameEngine,
    @Query('genre') genre: Genre,
    @Query('releaseStatus') releaseStatus: ReleaseStatus,
    @Query('donationAddress') donationAddress: string,
    @Query('tags') tags: string[],
    @Query('sortBy')
    sortBy: GamesListSortBy = GamesListSortBy.TIME,
    @Query('order')
    order: 'ASC' | 'DESC' = 'ASC',
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Game>> {
    const options = {
      username,
      paymentMode,
      classification,
      kind,
      genre,
      releaseStatus,
      donationAddress,
      tags,
      sortBy,
      order,
    };
    return this.gamesLogicService.paginateGameProjects(query, options);
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
  ): Promise<Game> {
    return this.gamesLogicService.createGameProject(user, file, body);
  }

  @Post('/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate a Game DTO which is to create a game project',
  })
  async validate(@Body() game: ValidateGameProjectDto) {
    await this.gamesLogicService.validateGameName(game);
  }

  @Get('/:id(\\d+)')
  @ApiOperation({ summary: 'get game project by id' })
  @ApiOkResponse({ type: Game })
  @ApiNotFoundResponse({ description: 'Game not found' })
  async getGameProjectById(@Param('id') id: number) {
    return this.gamesLogicService.findOne(id);
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
  ): Promise<Game> {
    return this.gamesLogicService.updateGameProject(id, user, file, body);
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
    await this.gamesLogicService.delete(id, user);
  }

  @Delete('/:id/file')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete the file directory of the game project' })
  async deleteGameProjectFiles(
    @Param('id') id: number,
    @CurrentUser() user: UserJWTPayload,
  ) {
    await this.gamesLogicService.deleteGameProjectFiles(id, user);
  }

  @Get('/get-id-by-projecturl')
  @ApiOperation({ summary: 'Get the game id by projectURL and username' })
  @ApiQuery({
    name: 'username',
    required: true
  })
  @ApiQuery({
    name: 'projectURL',
    required: true
  })
  async getIdByProjectURL(
    @Param('username') username: string,
    @Param('projectURL') projectURL: string) {
    const game = await this.gamesBaseService.findOneByProjectURL(username, projectURL);
    return { ok: true, id: game.id };
  }
}
