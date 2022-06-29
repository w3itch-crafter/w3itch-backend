import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';

@Module({
  providers: [FilesystemService],
  exports: [FilesystemService],
})
export class FilesystemModule {}
