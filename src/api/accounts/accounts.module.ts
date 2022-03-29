import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationModule } from '../../auth/module';
import { Account } from '../../entities/Account.entity';
import { UsersModule } from '../users/users.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JWTCookieHelper } from './jwt-cookie-helper';

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    TypeOrmModule.forFeature([Account]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, JWTCookieHelper],
  exports: [AccountsService, JWTCookieHelper],
})
export class AccountsModule {}
