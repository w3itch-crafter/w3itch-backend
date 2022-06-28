import { Injectable } from '@nestjs/common';

import { Game } from '../../entities/Game.entity';
import { UserJWTPayload } from '../../types';
import { CreateGameProjectDto } from './dto/create-game-proejct.dto';
import { GameFile, ISpecificGamesService } from './specific.games.service';

@Injectable()
export class DefaultGamesService implements ISpecificGamesService {
  uploadGame(
    user: Pick<UserJWTPayload, 'id' | 'username'>,
    file: GameFile,
    game: Game | CreateGameProjectDto,
  ): Promise<void> {
    // The generic business logic is in `games.logic.service.
    return;
  }

  deleteGameResourceDirectory(game: string) {
    // The generic business logic is in `games.logic.service.
    return;
  }
}
