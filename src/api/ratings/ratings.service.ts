import {
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { Game } from '../../entities/Game.entity';
import { Rating } from '../../entities/Rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  /**
   * Async task to update the rating column of a game
   * call this method when user add/update/delete a rating
   * @param {number} gameId
   * @returns {Promise<void>}
   * @private
   */
  private async updateGameRating(gameId: number) {
    const ratings = await this.ratingRepository.find({
      where: { gameId },
      select: ['rating'],
    });
    let rating: number | null = null;
    if (ratings.length) {
      const ratingsCount = ratings.length;
      const ratingValues = ratings.map((rating) => rating.rating);
      rating = Math.floor(
        ratingValues.reduce((a, b) => a + b, 0) / ratingsCount,
      );
    }
    await this.gameRepository.save({ id: gameId, rating });
  }

  public async findOneByUsernameAndGameId(
    gameId: number,
    username: string,
  ): Promise<Rating> {
    return await this.ratingRepository.findOne({
      where: { gameId, username },
    });
  }

  public async count(gameId: number): Promise<number> {
    return await this.ratingRepository.count({
      where: { gameId },
    });
  }

  public async delete(gameId: number, username: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { gameId, username },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    await this.ratingRepository.delete(rating.id);
    this.updateGameRating(gameId).then();
  }

  public async update(
    gameId: number,
    username: string,
    rating: number,
  ): Promise<Rating> {
    const game = await this.gameRepository.count({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    let entity = await this.ratingRepository.findOne({
      where: { gameId, username },
    });
    if (entity) {
      entity.rating = rating;
    } else {
      entity = new Rating();
      entity.gameId = gameId;
      entity.username = username;
      entity.rating = rating;
    }
    await this.ratingRepository.save(entity);
    this.updateGameRating(gameId).then();
    return entity;
  }
}
