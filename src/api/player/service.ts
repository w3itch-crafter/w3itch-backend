import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

import { serveFileWithETag } from '../../utils/serveFileWithETag';

@Injectable()
export class PlayerService {
  public async getPlayer(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(process.cwd(), 'thirdparty', path);
    await serveFileWithETag(req, res, filePath);
  }

  public async getPlayerIndex(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(process.cwd(), 'thirdparty', path, 'index.html');
    await serveFileWithETag(req, res, filePath);
  }
}
