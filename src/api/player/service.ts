import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { lookup } from 'mime-types';
import { join } from 'path';

@Injectable()
export class PlayerService {
  public async getPlayer(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(process.cwd(), 'thirdparty', path);
    const file = createReadStream(filePath);
    const contentType = lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    file.pipe(res);
  }

  public async getPlayerIndex(req: Request, res: Response): Promise<void> {
    const { path } = req;
    const filePath = join(process.cwd(), 'thirdparty', path, 'index.html');
    const file = createReadStream(filePath);
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    file.pipe(res);
  }
}
