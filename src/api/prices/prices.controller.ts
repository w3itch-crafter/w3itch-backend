import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Patch,
  Put,
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
import { Price } from '../../entities/Price.entity';
import { UserJWTPayload } from '../../types';
import { PaginationResponse } from '../../utils/responseClass';
import { GamesService } from '../games/games.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PricesLogicService } from './prices.logic.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Game Projects')
@Controller('game-projects')
export class PricesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesService: GamesService,
    private readonly pricesLogicService: PricesLogicService,
  ) {}

  @Get('/:id/prices')
  @ApiOperation({
    summary: 'Get an array of the prices of a game project',
  })
  async findByGameId(@Param('id') gameId: number): Promise<Price[]> {
    return await this.pricesLogicService.findByGameId(gameId);
  }

  @Put('/:id/prices/:chainId')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Create a price of a game project',
  })
  async createOrOverride(
    @Param('id') gameId: number,
    @Param('chainId') chainId: number,
    @Body() dto: CreatePriceDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<Price> {
    return await this.pricesLogicService.saveByUser(user, gameId, chainId, dto);
  }

  @Patch('/:id/prices/:chainId')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Update a price of a game project',
  })
  async update(
    @Param('id') gameId: number,
    @Param('chainId') chainId: number,
    @Body() dto: UpdatePriceDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<Price> {
    return await this.pricesLogicService.updateByUser(
      user,
      gameId,
      chainId,
      dto,
    );
  }

  @Delete('/:id/prices/:chainId')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Delete a price of a game project',
  })
  async delete(
    @Param('id') gameId: number,
    @Param('chainId') chainId: number,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<void> {
    return await this.pricesLogicService.deleteByUser(user, gameId, chainId);
  }
}
