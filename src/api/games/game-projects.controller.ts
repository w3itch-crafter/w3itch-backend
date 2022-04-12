import {
  BadRequestException,
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
import { Tag } from '../../entities/Tag.entity';
import { UpdateGameEntity, UserJWTPayload } from '../../types';
import { GamesListSortBy } from '../../types/enum';
import { PaginationResponse } from '../../utils/responseClass';
import { TagsService } from '../tags/tags.service';
import { CreateGameProjectWithFileDto } from './dto/create-game-proejct-with-file.dto';
import { UpdateGameProjectWithFileDto } from './dto/update-game-proejct-with-file.dto';
import { ValidateGameProjectDto } from './dto/validate-game-proejct.dto';
import { EasyRpgGamesService } from './easy-rpg.games.service';
import { GamesService } from './games.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Game Projects')
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
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Game>> {
    const options = {
      username,
      tags,
      sortBy,
      order,
    };
    return this.gamesService.paginateGameProjects(query, options);
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

    this.easyRpgGamesService.uploadGame(
      game.gameName,
      game.kind,
      file,
      game.charset,
    );
    const tags: Tag[] = await this.tagsService.getOrCreateByNames(game.tags);

    this.logger.verbose(
      `Tags of game: ${game.gameName} are ${JSON.stringify(tags)}`,
      this.constructor.name,
    );

    if (!game.donationAddress) {
      // default donation address is user's login wallet
      game.donationAddress = user.account.accountId;
    }

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
    await this.gamesService.verifyOwner(id, user);

    const { game } = body;
    const target = await this.gamesService.findOne(id);

    if (file) {
      this.logger.verbose(
        `Update File: ${file.originalname}, Game: ${JSON.stringify(game)}`,
        this.constructor.name,
      );
      if (file?.mimetype !== 'application/zip') {
        throw new BadRequestException(`Invalid mimetype: ${file?.mimetype}`);
      }
      this.easyRpgGamesService.uploadGame(
        target.gameName,
        game.kind,
        file,
        game.charset,
      );
    } else {
      this.logger.verbose(
        `Update game entity: ${JSON.stringify(game)} with no file uploaded`,
        this.constructor.name,
      );
    }

    const tags: Tag[] = await this.tagsService.getOrCreateByNames(game.tags);
    this.logger.verbose(
      `Tags of game: ${target.gameName} are ${JSON.stringify(tags)}`,
      this.constructor.name,
    );

    const entityToUpdate: Partial<UpdateGameEntity> = { ...game, tags };
    if (file) {
      entityToUpdate.file = file.originalname;
    }

    return await this.gamesService.update(id, entityToUpdate);
  }

  @Post('/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate a Game DTO which is to create a game project',
  })
  async validate(@Body() game: ValidateGameProjectDto) {
    await this.gamesService.validateGameName(game);
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
    await this.gamesService.verifyOwner(id, user);

    const target = await this.gamesService.findOne(id);
    this.easyRpgGamesService.deleteGameDirectory(target.gameName);
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
    await this.gamesService.verifyOwner(id, user);

    const target = await this.gamesService.findOne(id);
    await this.gamesService.update(id, { file: null });
    this.easyRpgGamesService.deleteGameDirectory(target.gameName);
  }
}
