import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { join } from 'path';

import { serveFileWithETag } from '../../utils/serveFileWithETag';

@ApiTags('Games')
@Controller('minetest')
export class MineTestController {
  constructor() {}

  @Get('')
  @Get('/')
  async getMineTestIndex(@Req() req: Request, @Res() res: Response) {
    const { path } = req;
    await this.fileServer(res, req, join(path, 'index.html'));
  }

  @Get('*')
  async getMineTest(@Req() req: Request, @Res() res: Response) {
    const { path } = req;
    await this.fileServer(res, req, path);
  }

  private async fileServer(
    res: Response<any, Record<string, any>>,
    req,
    path: string,
  ) {
    const filePath = join(process.cwd(), 'thirdparty', path);
    this.corp(res);
    await serveFileWithETag(req, res, filePath);
  }

  private corp(res: Response<any, Record<string, any>>) {
    res.set({
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
  }
}
