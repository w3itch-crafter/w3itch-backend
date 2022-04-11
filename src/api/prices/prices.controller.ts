import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Patch,
  Post,
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
import { verifyGameProjectOwner } from '../../utils/verifyGameProjectOwner';
import { GamesService } from '../games/games.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { PricesService } from './prices.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Game Projects')
@Controller('game-projects')
export class PricesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly gamesService: GamesService,
    private readonly pricesService: PricesService,
  ) {}

  @Get('/:id/prices')
  @ApiOperation({
    summary: 'Get an array of the prices of a game project',
  })
  async findByGameId(@Param('id') gameId: number): Promise<Price[]> {
    return await this.pricesService.findByGameId(gameId);
  }

  @Post('/:id/prices/:chainId')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Create a price of a game project',
  })
  async create(
    @Param('id') gameId: number,
    @Param('chainId') chainId: number,
    @Body() dto: CreatePriceDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<Price> {
    await verifyGameProjectOwner(this.gamesService, gameId, user);
    return await this.pricesService.create(gameId, chainId, dto);
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
    await verifyGameProjectOwner(this.gamesService, gameId, user);
    return await this.pricesService.update(gameId, chainId, dto);
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
    await verifyGameProjectOwner(this.gamesService, gameId, user);
    return await this.pricesService.delete(gameId, chainId);
  }
}
