import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import rootOptions from '../configs/ormconfig';

@Injectable()
export class TypeORMConfigService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return Object.assign(rootOptions, {
      autoLoadEntities: true,
      keepConnectionAlive: true,
    });
  }
}
