import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: new Logger()
        }
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
