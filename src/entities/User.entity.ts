import { IsUrl, Length, Matches } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  @Matches(/^[a-z0-9-]+$/)
  @Length(3, 15)
  username: string;

  @Column({ default: '' })
  @Length(1, 32)
  nickname: string;

  @Column({ default: '' })
  @Length(1, 200)
  bio: string;

  @Column({ default: 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png' })
  @IsUrl()
  avatar: string;
}
