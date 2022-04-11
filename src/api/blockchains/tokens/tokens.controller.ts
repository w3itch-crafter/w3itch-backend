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

import { JWTAuthGuard } from '../../../auth/guard';
import { Token } from '../../../entities/Token.entity';
import { PaginationResponse } from '../../../utils/responseClass';
import { CreateTokenDto } from './dto/create-token.dto';
import { DeleteTokenDto } from './dto/delete-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { TokensService } from './tokens.service';

@ApiExtraModels(PaginationResponse)
@ApiTags('Blockchains')
@Controller('blockchains/evm')
export class TokensController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly tokensService: TokensService,
  ) {}

  @Get('/:chainId/tokens')
  @ApiOperation({
    summary: 'Get tokens on a specific chain',
  })
  async getTokensByChainId(
    @Param('chainId') chainId: number,
  ): Promise<Token[]> {
    return await this.tokensService.getTokensByChainId(chainId);
  }

  @Post('/:chainId/tokens')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Create a token',
  })
  async create(
    @Param('chainId') chainId: number,
    @Body() dto: CreateTokenDto,
  ): Promise<Token> {
    return await this.tokensService.create(chainId, dto);
  }

  @Patch('/:chainId/tokens')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Update a token',
  })
  async update(
    @Param('chainId') chainId: number,
    @Body() dto: UpdateTokenDto,
  ): Promise<Token> {
    return await this.tokensService.update(chainId, dto);
  }

  @Delete('/:chainId/tokens')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Delete a token',
  })
  async delete(
    @Param('chainId') chainId: number,
    @Body() dto: DeleteTokenDto,
  ): Promise<void> {
    return await this.tokensService.delete(chainId, dto);
  }
}
