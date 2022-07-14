import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Account } from '../../entities/Account.entity';
import { User } from '../../entities/User.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  usernameReserved: string[];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
  ) {
    this.usernameReserved = this.configService.get<string[]>(
      'user.username.reservedList',
      [],
    );
  }

  async findOne(condition, options = {}) {
    return await this.usersRepository.findOne(condition, options);
  }

  async search(
    params: Partial<User>,
    options,
  ): Promise<{ result: User[]; total: number }> {
    const searches = Object.keys(params).map((key) => ({
      [key]: Like(`%${params[key]}%`),
    }));
    const [result, total] = await this.usersRepository.findAndCount({
      where: searches,
      ...options,
    });

    return { result, total };
  }

  async validateUsername(username: string): Promise<void> {
    if (this.usernameReserved.includes(username)) {
      throw new BadRequestException(
        `This username ${username} is reserved, please choose another one.`,
      );
    }
    if (await this.findOne({ username })) {
      throw new BadRequestException(
        `This username ${username} is already taken, please choose another one`,
      );
    }
  }

  async getUserInfo(conditions: Partial<User>): Promise<User> {
    return await this.usersRepository.findOne({
      where: conditions,
      relations: ['accounts'],
    });
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    return await this.usersRepository.findOne(uid);
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }

  async getBlockchainAddressByUsername(
    username: string,
  ): Promise<Account | undefined> {
    const queryBuilder = this.accountRepository.createQueryBuilder('account');
    return queryBuilder
      .select(['account.accountId'])
      .innerJoin(
        User,
        'user',
        ' user.username = :username AND account.userId = user.id ',
        { username },
      )
      .where(" account.platform = 'metamask'")
      .getOne();
  }
}
