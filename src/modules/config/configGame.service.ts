import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { ConfigGame } from 'database/entities/configGame.entity';

@Injectable()
export class ConfigGameService extends BaseService<ConfigGame> {
  constructor(
    @InjectRepository(ConfigGame)
    private configRepository: Repository<ConfigGame>,
  ) {
    super(configRepository);
  }

  async findByIdOrFail(id: string): Promise<ConfigGame> {
    return this.configRepository.findOneByOrFail({ id });
  }

  async findWithTag(tag: string): Promise<ConfigGame | null> {
    return this.configRepository.findOneBy({ tag });
  }
}
