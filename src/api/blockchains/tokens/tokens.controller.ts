import {
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
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

import { JWTAuthGuard } from '../../../auth/guard';
import { Token } from '../../../entities/Token.entity';
import { PaginationResponse } from '../../../utils/responseClass';
import { AddressValidationPipe } from './pipes/address-validation.pipe';
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

  @Put('/:chainId/tokens/:address')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Create a token',
  })
  async create(
    @Param(AddressValidationPipe) param: { chainId: number; address: string },
  ): Promise<Token> {
    const { chainId, address } = param;
    return await this.tokensService.save(chainId, address);
  }
}
