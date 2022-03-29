import { Module } from '@nestjs/common';

import { AuthenticationModule } from '../../../auth/module';
import { UsersModule } from '../../users/users.module';
import { AccountsModule } from '../accounts.module';
import { AccountsTokenController } from './accounts-token.controller';
import { AccountsTokenService } from './accounts-token.service';

@Module({
  imports: [UsersModule, AccountsModule, AuthenticationModule],
  controllers: [AccountsTokenController],
  providers: [AccountsTokenService],
})
export class AccountsTokenModule {}
