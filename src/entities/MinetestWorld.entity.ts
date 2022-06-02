import { Column, Entity, OneToOne } from 'typeorm';

import { MinetestWorldPortItem } from '../types';
import { BaseEntity } from './base.entity';

@Entity()
export class MinetestWorld extends BaseEntity implements MinetestWorldPortItem {
  @Column({ nullable: false })
  gameWorldName: string;
  @Column({ nullable: true })
  port: number;
}
