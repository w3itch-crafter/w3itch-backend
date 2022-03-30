import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import {
  Community,
  GameEngine,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../types/enum';
import { BaseEntity } from './base.entity';
import { Tag } from './Tag.entity';

@Entity()
export class Game extends BaseEntity {
  @Column()
  @Length(1, 50)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  /**
   * Game title
   * @type varchar(255)
   * @example 'Example'
   */
  @Column()
  @Length(1, 50)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ default: PaymentMode.FREE })
  @IsEnum(PaymentMode)
  @IsNotEmpty()
  paymentMode: PaymentMode;

  /**
   * Short description or tagline
   * @type varchar(255)
   * @example 'This is an example project'
   */
  @Column()
  @Length(1, 120)
  @IsString()
  subtitle: string;

  @Column()
  @Length(1, 150)
  @IsString()
  // doesn't allow starts or ends with _ or -
  @Matches(/^[^-_].*[^-_]$/)
  gameName: string;

  @Column()
  @Length(1, 150)
  @IsString()
  file: string;

  @Column({ default: ProjectClassification.GAMES })
  @IsEnum(ProjectClassification)
  @IsNotEmpty()
  classification: ProjectClassification;

  /**
   * Kind of the project (game engine)
   * @type varchar(255)
   * @default 'rm2k3e'
   */
  @Column({
    comment: 'Kind of the project (game engine)',
    default: GameEngine.RM2K3E,
  })
  @IsEnum(ProjectClassification)
  @IsNotEmpty()
  kind: GameEngine;

  @Column()
  @IsEnum(ReleaseStatus)
  releaseStatus: ReleaseStatus;

  @Column('simple-array', { comment: 'Game screenshots' })
  @IsUrl({ each: true })
  @IsOptional()
  screenshots: string[];

  @Column()
  @IsUrl()
  @IsNotEmpty()
  cover: string;

  @ManyToMany(() => Tag, (tag) => tag.game, {
    cascade: true,
  })
  @JoinTable()
  tags: string[];

  @Column()
  @IsInt()
  tokenId: number;

  @Column('simple-array')
  @Length(1, 120)
  @IsString({ each: true })
  appStoreLinks: string[];

  @Column('text')
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column({ default: Community.DISQUS })
  @IsEnum(Community)
  @IsNotEmpty()
  community: Community;

  @Column({ default: Genre.NO_GENRE })
  @IsEnum(Genre)
  @IsNotEmpty()
  genre: Genre;
}
