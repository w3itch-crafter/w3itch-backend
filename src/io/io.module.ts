import { Module } from '@nestjs/common';
import { FilesystemModule } from './filesystem/filesystem.module';
import { ZipModule } from './zip/zip.module';

@Module({
  imports: [FilesystemModule, ZipModule],
  exports: [FilesystemModule, ZipModule],
})
export class IoModule {}
