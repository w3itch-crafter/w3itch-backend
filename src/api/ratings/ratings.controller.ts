import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { Rating } from '../../entities/Rating.entity';
import { UserJWTPayload } from '../../types';
import { PaginationResponse } from '../../utils/responseClass';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Ratings')
@Controller('game-projects')
export class RatingsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly ratingsService: RatingsService,
  ) {}

  @Get('/:id/ratings/count')
  @ApiOperation({
    summary: 'Get count of ratings for a project',
  })
  async count(@Param('id') gameId: number): Promise<number> {
    return await this.ratingsService.count(gameId);
  }

  @Get('/:id/ratings/mine')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get your rating of a game project',
  })
  async getMine(
    @Param('id') gameId: number,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<Rating> {
    return await this.ratingsService.findOneByUsernameAndGameId(
      gameId,
      user.username,
    );
  }

  @Patch('/:id/ratings/mine')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Create or update your rating of a game project',
  })
  async update(
    @Param('id') gameId: number,
    @CurrentUser() user: UserJWTPayload,
    @Body() body: UpdateRatingDto,
  ): Promise<Rating> {
    return await this.ratingsService.update(gameId, user.username, body.rating);
  }

  @Delete('/:id/ratings/mine')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Delete your rating of a game project',
  })
  async delete(
    @Param('id') gameId: number,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<void> {
    return await this.ratingsService.delete(gameId, user.username);
  }
}
