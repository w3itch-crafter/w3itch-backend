import { PartialType } from '@nestjs/swagger';

import { CreateGameProjectDto } from './create-game-proejct.dto';

export class UpdateGameProjectDto extends PartialType(CreateGameProjectDto) {}
