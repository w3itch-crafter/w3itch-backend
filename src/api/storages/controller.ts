import {
  Post,
  Controller,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiConsumes,
  getSchemaPath,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../../auth/guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { UserJWTPayload } from '../../types';
import fleekStorage from '@fleekhq/fleek-storage-js';

import { StoragesService } from './service';

@ApiTags('Storage')
@Controller('storages')
export class StoragesController {
  constructor(private readonly storagesService: StoragesService) {}

  @Post('/upload-to-ipfs')
  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadToIPFS(
    @CurrentUser() user: UserJWTPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.storagesService.uploadToIPFS(
      user.id,
      file.originalname,
      file.buffer,
    );
  }
}
