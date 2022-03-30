import {
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fleekStorage from '@fleekhq/fleek-storage-js';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserJWTPayload } from '../../types';

@Injectable()
export class StoragesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {}

  public async uploadToIPFS(
    userId: number,
    fileName: string,
    data: string | Buffer,
  ): Promise<string> {
    try {
      //TODO Preprocessing / Compressing images
      const folder = this.configService.get<string>(
        'storage.ipfs.fleek.folder',
      );
      const output = await fleekStorage.upload({
        apiKey: this.configService.get<string>('storage.ipfs.fleek.apiKey'),
        apiSecret: this.configService.get<string>(
          'storage.ipfs.fleek.apiSecret',
        ),
        key: `${folder}/${userId}/${fileName}`,
        data,
      });
      this.logger.verbose(
        `Upload to IPFS, output ${JSON.stringify(output)}`,
        this.constructor.name,
      );

      return output.hash;
    } catch (error) {
      // Try to catch socket hang up error.
      this.logger.error(error, this.constructor.name);
      throw new InternalServerErrorException('Upload failed');
    }
  }
}
