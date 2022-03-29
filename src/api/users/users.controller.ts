import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { User } from '../../entities/User.entity';
import { UserJWTPayload } from '../../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { ValidateUsernameDto } from './dto/validate-username.dto';
import { UsersService } from './users.service';

@ApiCookieAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JWTAuthGuard)
  async getMyInfo(@CurrentUser() user: UserJWTPayload): Promise<User> {
    return this.usersService.getUserInfo(user.id);
  }

  @Patch('me')
  @UseGuards(JWTAuthGuard)
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserJWTPayload,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Put('me/username')
  @UseGuards(JWTAuthGuard)
  async setMyUsername(
    @CurrentUser() user: UserJWTPayload,
    @Body() body: UpdateUsernameDto,
  ): Promise<User> {
    return this.usersService.updateUsername(user.id, body.username);
  }

  @Post('username/validate')
  @HttpCode(HttpStatus.OK)
  async validateUsername(
    @Body() body: ValidateUsernameDto,
  ): Promise<{ isExists: boolean }> {
    return this.usersService.validateUsername(body.username);
  }
}
