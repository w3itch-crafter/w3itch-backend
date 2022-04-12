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
  @Matches(/^[a-z0-9-]+$/)
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
    minLength: 1,
    maxLength: 50,
  })
  @Column({ unique: true })
  @Length(1, 50)
  @IsString()
  // doesn't allow starts or ends with _ or -
  @Matches(/^[^-_].*[^-_]$/)
  gameName: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'Original name' })
  @Column({ nullable: true })
  @Length(1, 150)
  @IsString()
  file: string;

  @ApiProperty({
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
    enum: ReleaseStatus,
    default: ReleaseStatus.RELEASED,
  })
  @Column()
  @IsEnum(ReleaseStatus)
  releaseStatus: ReleaseStatus;

  @ApiProperty({ description: 'Screenshot URLs', required: false })
  @Column('simple-array', { comment: 'Game screenshots' })
  @IsUrl({ each: true })
  @IsOptional()
  @IsUrl({}, { each: true })
  screenshots: string[];

  @ApiProperty({ description: 'Cover URL' })
  @Column()
  @IsUrl()
  @IsNotEmpty()
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
  @OneToMany(() => Price, (price) => price.game)
  prices: Price[];

  @ApiProperty({ description: 'Donate wallet address of the creator' })
  @Column({ nullable: true })
  @IsEthereumAddress()
  donationAddress: string;

  @ApiProperty({
    description: 'Links to other app stores',
  })
  @Column('simple-array')
  @IsUrl({}, { each: true })
  @Length(1, 120, { each: true })
  appStoreLinks: string[];

  @ApiProperty()
  @Column('text')
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: Community,
    default: Community.DISQUS,
  })
  @Column({ default: Community.DISQUS })
  @IsEnum(Community)
  @IsNotEmpty()
  community: Community;

  @ApiProperty({
    enum: Genre,
    default: Genre.NO_GENRE,
  })
  @Column({ default: Genre.NO_GENRE })
  @IsEnum(Genre)
  @IsNotEmpty()
  genre: Genre;
}
