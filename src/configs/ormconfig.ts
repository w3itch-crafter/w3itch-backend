import { ConnectionOptions } from 'typeorm';

import { Account } from '../entities/Account.entity';
import { Game } from '../entities/Game.entity';
import { Rating } from '../entities/Rating.entity';
import { Tag } from '../entities/Tag.entity';
import { User } from '../entities/User.entity';
import { isDevelopment } from '../utils';
import { configBuilder } from './index';

interface Config {
  db: {
    host: string;
    port: number;
    timezone: string;
    username: string;
    password: string;
    database: string;
    charset: string;
  };
}

const config = configBuilder() as Config;

const options: ConnectionOptions = {
  type: 'mysql',
  host: config.db.host,
  port: +config.db.port || 3306,
  connectTimeout: 60 * 60 * 1000,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  charset: config.db.charset || 'utf8mb4_0900_ai_ci',
  entities: [User, Account, Game, Tag, Rating],
  synchronize: false,
  timezone: config.db.timezone || 'Z',
  logging: isDevelopment(),
  migrationsTableName: 'be_migrations',
  migrations: process.env.DB_MIGRATION && ['src/migrations/**/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
};

export default options;
