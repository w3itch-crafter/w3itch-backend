import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tag entities' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':name')
  @ApiOperation({
    summary: "Get a tag entity by it's name, or empty object if not found",
  })
  findOneByName(@Param('name') name: string) {
    return this.tagsService.fineOneByName(name);
  }

  @Patch(':name')
  @ApiCookieAuth()
  @ApiOperation({
    summary: "Update a tag entity by it's name, or create it if not found",
  })
  save(@Param('name') name: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.save(name, updateTagDto);
  }
}
