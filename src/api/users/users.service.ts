import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { User } from '../../entities/User.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(uid: number, options = {}) {
    return await this.usersRepository.findOne(uid, options);
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

  async validateUsername(username: string): Promise<{ isExists: boolean }> {
    return {
      isExists: Boolean(await this.usersRepository.findOne({ username })),
    };
  }

  async getUserInfo(uid: number): Promise<User> {
    return await this.usersRepository.findOne(uid);
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uid, updateUserDto);
    return await this.usersRepository.findOne(uid);
  }

  async save(saveParams = {}): Promise<User> {
    return await this.usersRepository.save(saveParams);
  }
}
