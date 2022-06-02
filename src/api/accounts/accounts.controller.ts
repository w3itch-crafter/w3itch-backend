import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { Account } from '../../entities/Account.entity';
import { UserJWTPayload } from '../../types';
import { AccountsService } from './accounts.service';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('mine')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  async getMyAccounts(@CurrentUser() user: UserJWTPayload): Promise<Account[]> {
    return await this.accountsService.find({ user: { id: user.id } });
  }
}
