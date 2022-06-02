import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './User.entity';

@Entity()
export class Account extends BaseEntity {
  @ManyToOne(() => User, (user) => user.accounts, {})
  user: User;

  @Column({
    nullable: false,
  })
  accountId: string;

  @Column({ nullable: false })
  platform: 'metamask' | string;
}
