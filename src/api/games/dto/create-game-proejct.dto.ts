import { ApiProperty } from '@nestjs/swagger';

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
  subtitle: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 50,
  })
  gameName: string;

  @ApiProperty({
    enum: ProjectClassification,
    default: ProjectClassification.GAMES,
  })
  classification: ProjectClassification;

  @ApiProperty({
    enum: GameEngine,
    default: GameEngine.RM2K3E,
  })
  kind: GameEngine;

  @ApiProperty({
    enum: ReleaseStatus,
    default: ReleaseStatus.RELEASED,
  })
  releaseStatus: ReleaseStatus;

  @ApiProperty({
    required: false,
  })
  screenshots: string[];

  @ApiProperty()
  cover: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  tokenId: number;

  @ApiProperty()
  appStoreLinks: string[];

  @ApiProperty()
  description: string;

  @ApiProperty({
    enum: Community,
    default: Community.DISQUS,
  })
  community: Community;

  @ApiProperty({
    enum: Genre,
    default: Genre.NO_GENRE,
  })
  genre: Genre;
}
