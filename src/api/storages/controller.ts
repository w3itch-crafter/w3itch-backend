import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { UserJWTPayload } from '../../types';
import { UploadResultDto } from './dto';
import { StoragesService } from './service';

@ApiTags('Storage')
@Controller('storages')
export class StoragesController {
  constructor(private readonly storagesService: StoragesService) {}

  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload to IPFS' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    type: UploadResultDto,
  })
  @Post('/upload-to-ipfs')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadToIPFS(
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResultDto> {
    return await this.storagesService.uploadToIPFS(
      user.id,
      file.originalname,
      file.buffer,
    );
  }

  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload to AWS' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    type: UploadResultDto,
  })
  @Post('/upload-to-aws')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadToAWS(
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResultDto> {
    return await this.storagesService.uploadToAWS(
      user.id,
      file.originalname,
      file.buffer,
    );
  }
}
