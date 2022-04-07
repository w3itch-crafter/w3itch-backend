import { NotFoundException, StreamableFile } from '@nestjs/common';
import etag from 'etag';
import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { lookup } from 'mime-types';
import { parse } from 'path';

export const serveFileWithETag = async (
  req: Request,
  res: Response,
  filePath: string,
) => {
  try {
    const file = await readFile(filePath);
    const contentType = lookup(filePath) || 'application/octet-stream';
    const tag = etag(file);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(
        parse(filePath).base,
      )}"`,
      ETag: tag,
    });

    if (req.headers['if-none-match'] === tag) {
      res.status(304);
      res.end();
    } else {
      new StreamableFile(file).getStream().pipe(res);
    }
  } catch (e) {
    console.error(e);
    throw new NotFoundException();
  }
};
