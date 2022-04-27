import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export abstract class UploadResultDto {
  @ApiResponseProperty()
  @ApiProperty({ description: 'public URL of the upload file' })
  publicUrl: string;

  @ApiResponseProperty()
  @ApiProperty({ description: 'the platform of the file uploaded to' })
  storageType: 's3' | 'ipfs';
}

export class UploadToIPFSResultDto extends UploadResultDto {
  @ApiResponseProperty()
  @ApiProperty({ description: 'IPFS CID of the upload file' })
  hash: string;
}

export class UploadToAWSResultDto extends UploadResultDto {
  @ApiResponseProperty()
  @ApiProperty({ description: 'AWS eTag of the upload file' })
  eTag: string;
}
