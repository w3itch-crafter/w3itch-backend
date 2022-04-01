import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
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
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import {
  Community,
  GameEngine,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../types/enum';
import { BaseEntity } from './base.entity';
import { Rating } from './Rating.entity';
import { Tag } from './Tag.entity';

@Entity()
export class Game extends BaseEntity {
  @ApiResponseProperty()
  @ApiProperty({ description: `Creator's username` })
  @Column()
  @Matches(/^[a-z0-9-]+$/)
  @Length(3, 15)
  @IsNotEmpty()
  username: string;

  /**
   * Game title
   * @type varchar(255)
   * @example 'Example'
   */
  @ApiProperty({ description: `Title` })
  @Column()
  @Length(1, 50)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @Column({ default: PaymentMode.FREE })
  @IsEnum(PaymentMode)
  @IsNotEmpty()
  paymentMode: PaymentMode;

  /**
   * Short description or tagline
   * @type varchar(255)
   * @example 'This is an example project'
   */
  @ApiProperty({ description: `Short description or tagline` })
  @Column()
  @Length(1, 120)
  @IsString()
  subtitle: string;

  @ApiProperty({ description: `For player` })
  @Column({ unique: true })
  @Length(1, 50)
  @IsString()
  // doesn't allow starts or ends with _ or -
  @Matches(/^[^-_].*[^-_]$/)
  gameName: string;

  @ApiResponseProperty()
  @ApiProperty({ description: `Original name` })
  @Column({ nullable: true })
  @Length(1, 150)
  @IsString()
  file: string;

  @ApiProperty({ description: `Classification` })
  @Column({ default: ProjectClassification.GAMES })
  @IsEnum(ProjectClassification)
  @IsNotEmpty()
  classification: ProjectClassification;

  /**
   * Kind of the project (game engine)
   * @type varchar(255)
   * @default 'rm2k3e'
   */
  @ApiProperty()
  @Column({
    comment: 'Kind of the project (game engine)',
    default: GameEngine.RM2K3E,
  })
  @IsEnum(GameEngine)
  @IsNotEmpty()
  kind: GameEngine;

  @ApiProperty()
  @Column()
  @IsEnum(ReleaseStatus)
  releaseStatus: ReleaseStatus;

  @ApiProperty({ description: `Screenshot URLs` })
  @Column('simple-array', { comment: 'Game screenshots' })
  @IsUrl({ each: true })
  @IsOptional()
  screenshots: string[];

  @ApiProperty({ description: `Cover URL` })
  @Column()
  @IsUrl()
  @IsNotEmpty()
  cover: string;

  @ManyToMany(() => Tag, (tag) => tag.game, {
    cascade: true,
  })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Rating, (rating) => rating.game)
  ratings: Rating[];

  @ApiProperty({ description: `Tokens to be held/paid to play this game` })
  @Column()
  @IsInt()
  tokenId: number;

  @ApiProperty({
    description: `Links to other app stores`,
  })
  @Column('simple-array')
  @Length(1, 120)
  @IsUrl({ each: true })
  appStoreLinks: string[];

  @ApiProperty()
  @Column('text')
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: `The community type of this game`,
  })
  @Column({ default: Community.DISQUS })
  @IsEnum(Community)
  @IsNotEmpty()
  community: Community;

  @ApiProperty({
    description: `The category that best describes this game`,
  })
  @Column({ default: Genre.NO_GENRE })
  @IsEnum(Genre)
  @IsNotEmpty()
  genre: Genre;
}
