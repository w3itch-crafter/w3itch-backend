import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';

@Injectable()
export class FilesystemService {
  public async deleteDirectory(path: string) {
    await fsPromises.rm(path, { recursive: true });
  }
  public async deleteFile(path: string) {
    await fsPromises.rm(path);
  }
  public async copyDirectory(from: string, to: string) {
    await fsPromises.cp(from, to, { recursive: true });
  }
  public async copy(from: string, to: string) {
    await fsPromises.cp(from, to);
  }
}
