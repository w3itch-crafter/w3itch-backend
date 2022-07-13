import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { FilesystemService } from '../../../io/filesystem/filesystem.service';
import { ZipService } from '../../../io/zip/zip.service';
import { HtmlGamesService } from './html.games.service';

describe('HtmlGamesService', () => {
  let service: HtmlGamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HtmlGamesService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: new Logger(),
        },
        FilesystemService,
        ZipService,
      ],
    }).compile();

    service = module.get<HtmlGamesService>(HtmlGamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
