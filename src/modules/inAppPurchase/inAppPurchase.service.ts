import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { InAppPurchase } from 'database/entities/inAppPurchase.entity';

@Injectable()
export class InAppPurchaseService extends BaseService<InAppPurchase> {
  constructor(
    @InjectRepository(InAppPurchase)
    private inAppPurchaseRepository: Repository<InAppPurchase>,
  ) {
    super(inAppPurchaseRepository);
  }

  async findByIdOrFail(id: string): Promise<InAppPurchase> {
    return this.inAppPurchaseRepository.findOneByOrFail({ id });
  }
}
