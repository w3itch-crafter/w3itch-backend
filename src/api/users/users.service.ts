import { BadRequestException, Injectable } from '@nestjs/common';
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

  async updateUsername(uid: number, username: string): Promise<User> {
    const isAlreadyExists = await this.usersRepository.findOne({ username });

    if (isAlreadyExists) {
      throw new BadRequestException('Username already exists.');
    }

    const user = await this.usersRepository.findOne(uid);
    if (user.username !== '') {
      throw new BadRequestException('User already has a username');
    }

    await this.usersRepository.update(uid, { username });
    return await this.usersRepository.findOne(uid);
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
