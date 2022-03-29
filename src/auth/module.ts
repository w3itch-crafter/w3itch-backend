import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Algorithm } from 'jsonwebtoken';

import { JWT_KEY } from '../constants';
import { AuthenticationService } from './service';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get<Algorithm>('jwt.algorithm'));
        return {
          issuer: configService.get<string>('jwt.issuer'),
          privateKey: JWT_KEY.privateKey,
          publicKey: JWT_KEY.publicKey,
          signOptions: {
            algorithm: configService.get<Algorithm>('jwt.algorithm'),
          },
          verifyOptions: {
            algorithms: [configService.get<Algorithm>('jwt.algorithm')],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService, JwtStrategy],
})
export class AuthenticationModule {}
