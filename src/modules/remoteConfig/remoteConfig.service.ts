import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { RemoteConfig } from 'database/entities/remoteConfig.entity';

@Injectable()
export class RemoteConfigService extends BaseService<RemoteConfig> {
  constructor(
    @InjectRepository(RemoteConfig)
    private remoteConfigRepository: Repository<RemoteConfig>,
  ) {
    super(remoteConfigRepository);
  }

  async findByIdOrFail(id: string): Promise<RemoteConfig> {
    return this.remoteConfigRepository.findOneByOrFail({ id });
  }
}
