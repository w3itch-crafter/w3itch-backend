import { Game } from '../../entities/Game.entity';
import { UserJWTPayload } from '../../types';
import { CreateGameProjectDto } from './dto/create-game-proejct.dto';

export interface GameFile {
  buffer: Buffer;
  originalname: string;
}

export interface ISpecificGamesService {
  uploadGame(
    user: Pick<UserJWTPayload, 'id' | 'username'>,
    file: GameFile,
    game: Game | CreateGameProjectDto,
  ): Promise<void>;

  deleteGameResourceDirectory(game: string);
}
