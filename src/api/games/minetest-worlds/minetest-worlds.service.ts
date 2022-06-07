import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { MinetestWorld } from '../../../entities/MinetestWorld.entity';

@Injectable()
export class MinetestWorldsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(MinetestWorld)
    private readonly minetestWorldRepository: Repository<MinetestWorld>,
  ) {}

  public async findOneByPort(port: number) {
    return await this.minetestWorldRepository.findOne({ port });
  }
  public async findOneByGameWorldName(gameWorldName: string) {
    return await this.minetestWorldRepository.findOne({ gameWorldName });
  }

  public async list(order) {
    return await this.minetestWorldRepository.find({
      order,
    });
  }
  public async getCurrentMaxPort() {
    const query =
      this.minetestWorldRepository.createQueryBuilder('minetestWorld');
    return query.select('max(minetestWorld.port)').getRawOne();
  }

  public async save(
    minetestWorld: Partial<MinetestWorld>,
  ): Promise<MinetestWorld> {
    return await this.minetestWorldRepository.save(minetestWorld);
  }

  public async delete(gameWorldName: string): Promise<void> {
    await this.minetestWorldRepository.delete({
      gameWorldName,
    });
  }
}
