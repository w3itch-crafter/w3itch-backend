import { Entity } from 'typeorm';

import { MinetestWorldPortItem } from '../types';
import { BaseEntity } from './base.entity';

@Entity()
export class MinetestWorld extends BaseEntity implements MinetestWorldPortItem {
  gameWorldName: string;
  port: number;
}
