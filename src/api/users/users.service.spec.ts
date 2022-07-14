import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const configuration = () => ({
    user: {
      username: {
        reservedList: ['api', 'background'],
      },
    },
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: {},
        },
        {
          provide: 'AccountRepository',
          useValue: {}
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: new Logger()
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.usernameReserved).toBeDefined();
  });
});
