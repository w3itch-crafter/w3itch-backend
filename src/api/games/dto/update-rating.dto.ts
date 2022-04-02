import { Max, Min } from 'class-validator';

export class UpdateRatingDto {
  @Min(100)
  @Max(500)
  rating: number;
}
