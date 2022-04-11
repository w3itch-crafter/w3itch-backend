import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { GamesService } from '../api/games/games.service';
import { User } from '../entities/User.entity';

export const verifyGameProjectOwner = async (
  gamesService: GamesService,
  gameId: number,
  user: User,
) => {
  const gameProject = await gamesService.findOne(gameId);

  if (!gameProject) {
    throw new NotFoundException('Game project not found');
  }

  if (user.username !== gameProject.username) {
    throw new ForbiddenException(
      "You don't have permission to modify this game project",
    );
  }
};
