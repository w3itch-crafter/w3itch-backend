import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';

export class UploadUrlDto {
  @ApiProperty()
  url: string;
}

@Controller('image')
@ApiCookieAuth()
@ApiTags('image')
export class ImageController {
  constructor(private readonly httpService: HttpService) {}

  @Post('uploadByUrl')
  async uploadImage(@Body() { url }: UploadUrlDto) {
    const { data } = await lastValueFrom(
      this.httpService.post<string>('/image/uploadByUrl', url, {
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    );

    return data;
  }
}
