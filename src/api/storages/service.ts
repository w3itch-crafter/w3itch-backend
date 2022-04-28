import fleekStorage from '@fleekhq/fleek-storage-js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import escapeRegExp from 'lodash.escaperegexp';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { UploadToAWSResultDto, UploadToIPFSResultDto } from './dto';

@Injectable()
export class StoragesService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  private readonly s3 = new AWS.S3({
    accessKeyId: this.configService.get('storage.aws.accessKeyId'),
    secretAccessKey: this.configService.get('storage.aws.secretAccessKey'),
  });

  public async uploadToAWS(
    userId: number,
    fileName: string,
    data: string | Buffer,
  ): Promise<UploadToAWSResultDto> {
    try {
      const folder = this.configService.get<string>('storage.aws.folder');
      const bucket = this.configService.get<string>('storage.aws.bucket');
      const customBaseUrl = this.configService.get('storage.aws.customBaseUrl');
      const output = await this.s3
        .upload({
          Bucket: bucket,
          Key: `${folder}/${userId}/${fileName}`,
          Body: data,
        })
        .promise();
      this.logger.verbose(
        `Upload to IPFS, output ${JSON.stringify(output)}`,
        this.constructor.name,
      );
      let imageUrl = output.Location;

      if (customBaseUrl) {
        imageUrl = imageUrl.replace(
          new RegExp(`^https?://.+?${escapeRegExp(bucket)}/`),
          customBaseUrl.endsWith('/') ? customBaseUrl : `${customBaseUrl}/`,
        );
      }
      return {
        publicUrl: imageUrl,
        eTag: output.ETag.replace(/"/g, ''),
        storageType: 's3',
      };
    } catch (error) {
      this.logger.error(error, this.constructor.name);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  public async uploadToIPFS(
    userId: number,
    fileName: string,
    data: string | Buffer,
  ): Promise<UploadToIPFSResultDto> {
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

      return {
        ...output,
        storageType: 'ipfs',
      };
    } catch (error) {
      // Try to catch socket hang up error.
      this.logger.error(error, this.constructor.name);
      throw new InternalServerErrorException('Upload failed');
    }
  }
}
