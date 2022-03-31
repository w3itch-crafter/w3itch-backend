import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tag } from '../../entities/Tag.entity';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  findAll() {
    return this.tagsRepository.find();
  }

  async save(name: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const exists = await this.tagsRepository.findOne({ name });
    if (exists) {
      return this.tagsRepository.save({
        ...exists,
        ...updateTagDto,
      });
    } else {
      return this.tagsRepository.create({
        name,
        ...updateTagDto,
      });
    }
  }

  async fineOneByName(name: string): Promise<Tag> {
    return this.tagsRepository.findOne({ name });
  }

  async getOrCreateByName(name: string): Promise<Tag> {
    const exists = await this.tagsRepository.findOne({ name });
    return exists || this.tagsRepository.create({ name, label: name });
  }
}
