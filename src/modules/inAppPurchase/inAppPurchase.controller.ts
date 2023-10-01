import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InAppPurchase, User } from 'database/entities';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InAppPurchaseService } from './inAppPurchase.service';
import { CurrentUser } from '../auth/decorators';

@Controller('InAppPurchase')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('InAppPurchase')
export class InAppPurchaseController {
  constructor(private readonly inAppPurchaseService: InAppPurchaseService) {}

  @Get('NonConsumable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: InAppPurchase })
  async GetNonConsumable(@CurrentUser() user: User): Promise<InAppPurchase[]> {
    return (await this.inAppPurchaseService.findAll()).filter(
      (x) => x.userId === user.id && !x.consumable,
    );
  }
}
