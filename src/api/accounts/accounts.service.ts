import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticationService } from '../../auth/service';
import { Account } from '../../entities/Account.entity';
import { User } from '../../entities/User.entity';
import { UsersService } from '../users/users.service';
import {
  AccountsLoginVerifier,
  AccountsSignupVerifier,
} from './accounts.verifier';
import { JWTTokens, Platforms } from './type';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly authService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  async find(searchParams: any): Promise<Account[]> {
    return await this.accountsRepository.find(searchParams);
  }
  async findOne(searchParams: any, options = {}): Promise<Account> {
    return await this.accountsRepository.findOne(searchParams, options);
  }
  async save(saveParams: any): Promise<Account> {
    return await this.accountsRepository.save(saveParams);
  }
  async delete(accountId: number) {
    return await this.accountsRepository.delete(accountId);
  }

  private async initUser(
    username: string,
    userAccountData: {
      accountId: string;
      platform: string;
    },
  ): Promise<{ user: User; userAccount: Account }> {
    const user = await this.usersService.save({
      username,
    });
    const userAccount = await this.save({
      ...userAccountData,
      userId: user.id,
    });

    return { user, userAccount };
  }

  async getUser(userAccountData: {
    accountId: string;
    platform: string;
  }): Promise<{ user: User; userAccount: Account }> {
    const userAccount: Account = await this.findOne(userAccountData);

    const user = userAccount
      ? await this.usersService.findOne(userAccount.userId)
      : null;

    return { user, userAccount };
  }

  async login(
    accountLoginDto: any,
    platform: Platforms,
    verify: AccountsLoginVerifier,
  ) {
    await verify(accountLoginDto);

    const userAccountData = {
      accountId: accountLoginDto.account,
      platform,
    };

    const { user, userAccount } = await this.getUser(userAccountData);

    if (!user || !userAccount) {
      throw new UnauthorizedException(
        'User account does not exist.',
        'UserNotFound',
      );
    }

    const tokens: JWTTokens = await this.authService.signLoginJWT(
      user,
      userAccount,
    );
    return {
      user,
      tokens,
      account: userAccount,
    };
  }

  async signup(
    accountSignupDto: any,
    platform: Platforms,
    verify: AccountsSignupVerifier,
  ) {
    await verify(accountSignupDto);

    const userAccountData = {
      accountId: accountSignupDto.account,
      platform,
    };

    const hasAlreadySigned: { user; userAccount } = await this.getUser(
      userAccountData,
    );

    if (hasAlreadySigned.user) {
      throw new BadRequestException('User is signed already, please login.');
    }

    const { user, userAccount } = await this.initUser(
      accountSignupDto.username,
      userAccountData,
    );

    const tokens: JWTTokens = await this.authService.signLoginJWT(
      user,
      userAccount,
    );
    return {
      user,
      tokens,
      account: userAccount,
    };
  }
}
