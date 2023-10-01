import {
  Get,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'database/entities';
import { UserRole } from 'database/enums';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { FindOneParams } from 'database/dtos';
import { CurrentUser, Roles } from '../auth/decorators';
import { UserGameInfoService } from './userGameInfo.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

import { UserRankDataResponse } from './dtos/userRankDataResponse.dto';
import { GetRankRequest } from './dtos/getRankRequest.dto';
import { UploadAvatarRequest } from './dtos/uploadAvatarRequest.dto';
import { UserGameDataInfo } from './dtos/userGameDataInfo.dto';
import { ChangeNameRequest } from './dtos/changeNameRequest.dto';

@Controller('userGameInfos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('UserGameInfo')
export class UserGameInfoController {
  constructor(private readonly userGameInfoService: UserGameInfoService) {}

  @Post('userGameInfos/get-user-game-info')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async getUserGameInfo(@CurrentUser() user: User): Promise<UserGameInfo> {
    return this.userGameInfoService.GetUserGameInfo(user);
  }

  @Post('userGameInfos/get-user-game-rank-info')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: GetRankRequest })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async getUserGameRankInfo(
    @CurrentUser() user: User,
    @Body() body: GetRankRequest,
  ): Promise<UserRankDataResponse> {
    if (body.rankType === 0) {
      return this.userGameInfoService.GetUserRank(user, body.rankTimeType);
    }
    return this.userGameInfoService.GetUserRankStreak(user, body.rankTimeType);
  }

  @Post('get-user-game-rank-event-info')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async getUserRankEvent(@CurrentUser() user: User): Promise<UserRankDataResponse> {
    return this.userGameInfoService.GetUserRankEvent(user);
  }

  @Post('userGameInfos/upload-avatar')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UploadAvatarRequest })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async uploadAvatar(
    @CurrentUser() user: User,
    @Body() body: UploadAvatarRequest,
  ): Promise<UserGameInfo | null> {
    return this.userGameInfoService.uploadAvatar(user, body.base64Avatar);
  }

  @Post('userGameInfos/change-name')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ChangeNameRequest })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async changeName(
    @CurrentUser() user: User,
    @Body() body: ChangeNameRequest,
  ): Promise<UserGameInfo | null> {
    return this.userGameInfoService.changeName(user, body.userName);
  }

  @Post('userGameInfos/upgrade-ambassador-level')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: UserGameInfo })
  @Roles(UserRole.USER, UserRole.ADMIN)
  async upgradeAmbassadorLevel(@CurrentUser() user: User): Promise<UserGameInfo | null> {
    return this.userGameInfoService.upgradeAmbassadorLevel(user);
  }

  @Get('AmountTop3')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOkResponse({ status: HttpStatus.OK, type: 'number' })
  async amountTop3(@CurrentUser() user: User): Promise<number> {
    return this.userGameInfoService.getAmountTop3Event(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: UserGameDataInfo })
  async getQuestionById(@Param() { id }: FindOneParams): Promise<UserGameDataInfo> {
    return this.userGameInfoService.getUserDataGameInfo(id);
  }
}
