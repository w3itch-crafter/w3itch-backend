import { Injectable } from '@nestjs/common';

import { GameEngine } from '../../types/enum';
import { ISpecificGamesService } from './specific.games.service';

@Injectable()
export class DefaultGamesService implements ISpecificGamesService {
  uploadGame(
    game: string,
    engine: GameEngine,
    file: Express.Multer.File,
    charset?: string,
  ): Promise<void> {
    // The generic business logic is in `games.logic.service.
    return;
  }

  deleteGameResourceDirectory(game: string) {
    // The generic business logic is in `games.logic.service.
    return;
  }
}
