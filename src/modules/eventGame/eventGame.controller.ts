import { Get, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'database/enums';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { User } from 'database/entities';
import { EventGame } from 'database/entities/eventGame.entity';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventGameService } from './eventGame.service';
import { TakeInEventRequest } from './dtos/takeInEventRequest.dto';
import { CreateEventRequest } from './dtos/createEventRequest.dto';

@Controller('EventGame')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('EventGame')
export class EventGameController {
  constructor(private readonly eventGameService: EventGameService) {}

  @Post('create-event-game')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateEventRequest })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOkResponse({ status: HttpStatus.OK, type: UserGameInfo })
  async createEvent(
    @CurrentUser() user: User,
    @Body() body: CreateEventRequest,
  ): Promise<UserGameInfo | null> {
    return this.eventGameService.createEvent(
      user,
      body.eventName,
      body.amountPlayer,
      body.password,
      body.startTime,
      body.endTime,
    );
  }

  @Post('take-in-event')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: TakeInEventRequest })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOkResponse({ status: HttpStatus.OK, type: UserGameInfo })
  async takeinEvent(
    @CurrentUser() user: User,
    @Body() body: TakeInEventRequest,
  ): Promise<UserGameInfo | null> {
    return this.eventGameService.TakeInEvent(user, body.eventId, body.password);
  }

  @Get('listEvent')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: [EventGame] })
  async getListEvent(): Promise<EventGame[]> {
    return (await this.eventGameService.findAll()).filter(
      (x) => x.endTime.getTime() > new Date(Date.now()).getTime(),
    );
  }
}
