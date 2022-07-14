import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { User } from '../../entities/User.entity';
import { UserJWTPayload } from '../../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private logger: LoggerService,
  ) {}

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
  @Post('get-blockchain-address-by-username')
  async getBlockchainAddressByUsername(@Body() body: { username?: string }) {
    if (body.username) {
      const { username } = body;
      const account = await this.usersService.getBlockchainAddressByUsername(
        username,
      );
      return { address: account?.accountId };
    }
    throw new BadRequestException('need username');
  }
}
