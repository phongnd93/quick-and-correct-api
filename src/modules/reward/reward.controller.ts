import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'database/enums';
import { User } from 'database/entities';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RewardService } from './reward.service';
import { RewardResponse } from './dtos/rewardResponse.dto';
import { CurrentUser, Roles } from '../auth/decorators';
import { IAPRequest } from '../inAppPurchase/dtos/iapRequest.dto';
import { IAPResponse } from '../inAppPurchase/dtos/iapResponse.dto';
import { IAPCreateRequest } from '../inAppPurchase/dtos/iapCreateRequest.dto';

@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post('reward/claim-daily_reward')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: RewardResponse })
  @Roles(UserRole.USER)
  async claimDailyReward(@CurrentUser() user: User): Promise<IAPResponse> {
    return this.rewardService.claimDailyReward(user);
  }

  @Post('reward/buy-iap-pack')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: RewardResponse })
  @ApiBody({ type: IAPRequest })
  @Roles(UserRole.USER)
  async buyIAPPack(@CurrentUser() user: User, @Body() body: IAPRequest): Promise<IAPResponse> {
    return this.rewardService.buyIAPPack(user, body.apiPackage);
  }

  @Post('reward/add-package')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: 'bool' })
  @ApiBody({ type: IAPCreateRequest })
  @Roles(UserRole.ADMIN)
  async addIAPPackage(@CurrentUser() user: User, @Body() body: IAPCreateRequest): Promise<boolean> {
    const reward = {
      ruby: body.ruby,
      save: body.save,
      help: body.help,
    };
    await this.rewardService.create({
      reward: JSON.stringify(reward),
      eventType: body.type,
      iapPackage: body.iapPackage,
    });
    return true;
  }
}
