import { IsUrl, Length, Matches } from 'class-validator';
import { Column, Entity, JoinTable, OneToMany } from 'typeorm';

import { Account } from './Account.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  @Matches(/^[a-z\d-]+$/, {
    message:
      'username should contain only lowercase letters, numbers and dashes (-)',
  })
  @Length(3, 15)
  username: string;

  @Column({ default: '' })
  @Length(1, 32)
  nickname: string;

  @Column({ default: '' })
  @Length(1, 200)
  bio: string;

  @Column({
    default:
      'https://image.w3itch.io/w3itch-test/attachment/5/c388baa8-c244-4782-9807-978a8dcb7700.pngg',
  })
  @IsUrl()
  avatar: string;

  @OneToMany(() => Account, (account) => account.user, {})
  accounts: Account[];
}
