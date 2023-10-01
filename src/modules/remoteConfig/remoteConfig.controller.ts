import { Controller, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RemoteConfig } from 'database/entities/remoteConfig.entity';
import { RemoteConfigService } from './remoteConfig.service';

@Controller('RemoteConfig')
@ApiTags('RemoteConfig')
export class RemoteConfigController {
  constructor(private readonly remoteConfigService: RemoteConfigService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ status: HttpStatus.OK, type: RemoteConfig })
  async getVersionConfig(
    @Query('version') version: string,
    @Query('os') os: string,
  ): Promise<RemoteConfig | null> {
    return this.remoteConfigService.findOne({ version, os });
  }
}
