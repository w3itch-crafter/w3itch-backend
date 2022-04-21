import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { User } from '../../entities/User.entity';
import { UserJWTPayload } from '../../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  async getMyInfo(@CurrentUser() user: UserJWTPayload): Promise<User> {
    return this.usersService.getUserInfo({ id: user.id });
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.getUserInfo({ username });
  }

  @Patch('me')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }
}
