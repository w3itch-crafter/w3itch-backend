import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
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
  GameFileCharset,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../types/enum';
import { BaseEntity } from './base.entity';
import { Price } from './Price.entity';
import { Tag } from './Tag.entity';

@Entity()
export class Game extends BaseEntity {
  @ApiResponseProperty()
  @ApiProperty({ description: "Creator's username" })
  @Column()
  @Matches(/^[a-z\d-]+$/)
  @Length(3, 15)
  @IsNotEmpty()
  username: string;

  /**
   * Game title
   * @type varchar(255)
   * @example 'Example'
   */
  @ApiProperty({ description: 'Title' })
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
  @ApiProperty({ description: 'Short description or tagline' })
  @Column()
  @Length(1, 120)
  @IsString()
  subtitle: string;

  @ApiProperty({
    description: 'Unique identifier name of the game',
    minLength: 1,
    maxLength: 50,
  })
  @Column({ unique: true })
  @Length(1, 50)
  @IsString()
  @Matches(/(^[^-_].*[^-_]$)|(^[^-_]$)/, {
    message:
      'Game name must not start or end with - or _, and length must be between 1 and 50',
  })
  gameName: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'Original name' })
  @Column({ nullable: true })
  @Length(1, 150)
  @IsString()
  file: string;

  @ApiProperty({
    enum: GameFileCharset,
    default: GameFileCharset.UTF8,
    required: false,
  })
  @Column({ default: GameFileCharset.UTF8 })
  @IsEnum(GameFileCharset)
  @IsOptional()
  charset: GameFileCharset;

  @ApiProperty({
    description: 'Project classification',
    enum: ProjectClassification,
    default: ProjectClassification.GAMES,
  })
  @Column({ default: ProjectClassification.GAMES })
  @IsEnum(ProjectClassification)
  @IsNotEmpty()
  classification: ProjectClassification;

  /**
   * Kind of the project (game engine)
   * @type varchar(255)
   * @default 'rm2k3e'
   */
  @ApiProperty({
    enum: GameEngine,
    description: 'Kind of the project (game engine)',
    default: GameEngine.RM2K3E,
  })
  @Column({
    comment: 'Kind of the project (game engine)',
    default: GameEngine.RM2K3E,
  })
  @IsEnum(GameEngine)
  @IsNotEmpty()
  kind: GameEngine;

  @ApiProperty({
    description: 'Release status',
    enum: ReleaseStatus,
    default: ReleaseStatus.RELEASED,
  })
  @Column()
  @IsEnum(ReleaseStatus)
  releaseStatus: ReleaseStatus;

  @ApiProperty({ description: 'Screenshot URLs', required: false })
  @Column('simple-array', { comment: 'Game screenshots' })
  @IsOptional()
  @IsUrl({}, { each: true })
  screenshots: string[];

  @ApiProperty({ description: 'Cover URL' })
  @Column()
  @IsUrl()
  @IsOptional()
  cover: string;

  @ManyToMany(() => Tag, (tag) => tag.game, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  tags: Tag[];

  @ApiProperty({ description: 'Calculated average rating of the game' })
  @Column({ nullable: true })
  @IsInt()
  rating: number;

  @ApiProperty({ description: 'Tokens to be held/paid to play this game' })
  @OneToMany(() => Price, (price) => price.game, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  prices: Price[];

  @ApiProperty({ description: 'Donate wallet address of the creator' })
  @Column({ nullable: true })
  @IsOptional()
  @IsEthereumAddress()
  donationAddress?: string;

  @ApiProperty({
    description: 'Links to other app stores',
  })
  @Column('simple-array')
  @IsUrl({}, { each: true })
  @Length(1, 120, { each: true })
  appStoreLinks: string[];

  @ApiProperty()
  @Column('longtext')
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'The community type of this game',
    enum: Community,
    default: Community.DISQUS,
  })
  @Column({ default: Community.DISQUS })
  @IsEnum(Community)
  @IsNotEmpty()
  community: Community;

  @ApiProperty({
    description: 'The category that best describes this game',
    enum: Genre,
    default: Genre.NO_GENRE,
  })
  @Column({ default: Genre.NO_GENRE })
  @IsEnum(Genre)
  @IsNotEmpty()
  genre: Genre;
}
