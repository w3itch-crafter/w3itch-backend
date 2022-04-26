import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiResponseProperty()
  @ApiProperty({ description: 'IPFS CID of the upload file' })
  hash?: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'AWS etag of the upload file' })
  eTag?: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'public URL of the upload file' })
  publicUrl: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'the platform of the file uploaded to' })
  storageType: 's3' | 'ipfs';
}
