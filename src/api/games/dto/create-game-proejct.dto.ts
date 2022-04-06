import { ApiProperty } from '@nestjs/swagger';
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

import {
  Community,
  GameEngine,
  Genre,
  PaymentMode,
  ProjectClassification,
  ReleaseStatus,
} from '../../../types/enum';

export class CreateGameProjectDto {
  @ApiProperty({
    minLength: 1,
    maxLength: 50,
  })
  @Length(1, 50)
  title: string;

  @ApiProperty({
    enum: PaymentMode,
    default: PaymentMode.FREE,
  })
  paymentMode: PaymentMode;

  @ApiProperty({
    minLength: 1,
    maxLength: 120,
  })
  @Length(1, 120)
  subtitle: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 50,
  })
  @Length(1, 50)
  @Matches(/^[^-_].*[^-_]$/)
  gameName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  charset: string;

  @ApiProperty({
    enum: ProjectClassification,
    default: ProjectClassification.GAMES,
  })
  @IsEnum(ProjectClassification)
  classification: ProjectClassification;

  @ApiProperty({
    enum: GameEngine,
    default: GameEngine.RM2K3E,
  })
  @IsEnum(GameEngine)
  kind: GameEngine;

  @ApiProperty({
    enum: ReleaseStatus,
    default: ReleaseStatus.RELEASED,
  })
  @IsEnum(ReleaseStatus)
  releaseStatus: ReleaseStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { each: true })
  screenshots: string[];

  @ApiProperty()
  @IsUrl()
  cover: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(2, 60, { each: true })
  @Matches(/^[a-z0-9\-]+$/, { each: true })
  tags: string[];

  @ApiProperty()
  @IsInt()
  tokenId: number;

  @ApiProperty()
  @IsUrl({}, { each: true })
  @Length(1, 120, { each: true })
  appStoreLinks: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: Community,
    default: Community.DISQUS,
  })
  @IsEnum(Community)
  community: Community;

  @ApiProperty({
    enum: Genre,
    default: Genre.NO_GENRE,
  })
  @IsEnum(Genre)
  genre: Genre;
}
