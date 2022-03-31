import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity()
export class Account extends BaseEntity {
  @Column({
    nullable: false,
  })
  userId: number;

  @Column({
    nullable: false,
  })
  accountId: string;

  @Column({ nullable: false })
  platform: 'metamask' | string;
}
