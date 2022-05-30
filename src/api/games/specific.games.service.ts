import { GameEngine } from '../../types/enum';

export interface ISpecificGamesService {
  uploadGame(
    game: string,
    engine: GameEngine,
    file: Express.Multer.File,
    charset?: string,
  ): Promise<void>;

  deleteGameResourceDirectory(game: string);
}
