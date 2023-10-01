import { Controller, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AMBASSADOR_CONFIG_TAG } from 'src/common/constanst/gameConstant';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpgradeAmbassadorConfig } from './dtos/upgradeAmbassadorConfig.dto';
import { ConfigGameService } from './configGame.service';

@Controller('Config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Config')
export class ConfigGameController {
  constructor(private readonly configService: ConfigGameService) {}

  @Get('get-ambassador-config')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: UpgradeAmbassadorConfig })
  async getAmbassadorConfig(): Promise<UpgradeAmbassadorConfig[]> {
    const configData = await this.configService.findWithTag(AMBASSADOR_CONFIG_TAG);
    if (configData) {
      return JSON.parse(configData.config);
    }
    throw new Error('');
  }
}
