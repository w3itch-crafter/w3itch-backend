import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class UploadToIPFSResultDto {
  @ApiResponseProperty()
  @ApiProperty({ description: 'IPFS CID of upload file' })
  hash: string;
  @ApiResponseProperty()
  @ApiProperty({ description: 'public URL of upload file' })
  publicUrl: string;
}
