import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip-iconv';

@Injectable()
export class ZipService {
  constructor() {}
  public async extractAllTo(
    zip: AdmZip,
    targetPath: string,
    overwrite: boolean,
  ) {
    zip.extractAllTo(targetPath, overwrite);
  }
}
