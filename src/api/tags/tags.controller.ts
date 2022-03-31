import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':name')
  findOneByName(@Param('name') name: string) {
    return this.tagsService.fineOneByName(name);
  }

  @Patch(':name')
  save(@Param('name') name: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.save(name, updateTagDto);
  }
}
