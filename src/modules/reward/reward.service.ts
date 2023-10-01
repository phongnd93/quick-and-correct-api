import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { Reward, User } from 'database/entities';
import { EventType } from 'database/enums/event-type';
import { IAP_PACKAGE_DAILY_1 } from 'src/common/constanst/gameConstant';
import { D2MBadRequestException } from 'src/common/infra-exception';
import { UserGameInfoService } from '../userGameInfo/userGameInfo.service';
import { IAPResponse } from '../inAppPurchase/dtos/iapResponse.dto';
import { InAppPurchaseService } from '../inAppPurchase/inAppPurchase.service';

@Injectable()
export class RewardService extends BaseService<Reward> {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private userGameInfoService: UserGameInfoService,
    private inAppPurchaseService: InAppPurchaseService,
  ) {
    super(rewardRepository);
  }

  async findByIdOrFail(id: string): Promise<Reward> {
    return this.rewardRepository.findOneByOrFail({ id });
  }

  async claimDailyReward(user: User): Promise<IAPResponse> {
    const reward = await this.findOne({ eventType: EventType.DAILY });
    if (reward) {
      const rewardData = JSON.parse(reward.reward);
      const info = await this.userGameInfoService.findOne({ userId: user.id });
      if (info && info.isDailyReward) {
        return this.userGameInfoService.getReward(user.id, rewardData, EventType.DAILY);
      }

      throw new D2MBadRequestException('Bạn đã nhận quà hằng ngày. Hãy quay lại vào ngày mai!');
    }

    throw new Error('Reward not exists');
  }

  async buyIAPPack(user: User, iapPackage: string): Promise<IAPResponse> {
    const result: IAPResponse = new IAPResponse();
    const pack = await this.findOne({ iapPackage });
    if (pack) {
      if (pack.eventType === EventType.IAP_NONCONSUMABLE) {
        const iapInfo = await this.inAppPurchaseService.findOne({
          userId: user.id,
          package: iapPackage,
        });
        if (iapInfo) {
          throw new D2MBadRequestException('This package is bought!');
        }
      }
      if (iapPackage === IAP_PACKAGE_DAILY_1) {
        await this.userGameInfoService.updateDailyreward(user, pack.reward);
        await this.inAppPurchaseService.create({
          userId: user.id,
          package: iapPackage,
          orderId: '',
          consumable: pack.eventType === EventType.IAP_CONSUMABLE,
        });
        return result;
      }

      const rewardData = JSON.parse(pack.reward);
      await this.userGameInfoService.getReward(user.id, rewardData, pack.eventType);
      await this.inAppPurchaseService.create({
        userId: user.id,
        package: iapPackage,
        orderId: '',
        consumable: pack.eventType === EventType.IAP_CONSUMABLE,
      });
      result.ruby = rewardData.ruby;
      result.save = rewardData.save;
      result.help = rewardData.help;
      return result;
    }
    throw new Error('Reward not exists');
  }
}
