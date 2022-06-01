import { Game } from '../../entities/Game.entity';
import { UserJWTPayload } from '../../types';
import { CreateGameProjectDto } from './dto/create-game-proejct.dto';

export interface ISpecificGamesService {
  uploadGame(
    user: UserJWTPayload,
    file: Express.Multer.File,
    game: Game | CreateGameProjectDto,
  ): Promise<void>;

  deleteGameResourceDirectory(game: string);
}
