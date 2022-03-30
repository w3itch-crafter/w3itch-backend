import { ApiResponseProperty } from '@nestjs/swagger';

export class UploadToIPFSResultDto {
  @ApiResponseProperty()
  hash: string;
  @ApiResponseProperty()
  publicUrl: string;
}
