import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity()
export class Account extends BaseEntity {
  @Column({
    nullable: false,
  })
  user_id: number;

  @Column({
    nullable: false,
  })
  account_id: string;

  @Column({ nullable: false })
  platform: 'metamask' | string;
}
