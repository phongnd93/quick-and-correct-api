import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'database/entities';
import { UserRole } from 'database/enums';
import { Room } from 'database/entities/room.entity';
import { FindOneParams } from 'database/dtos';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { AnswerRequest } from './dtos/answerRequest.dto';
import { RoomCreateRequest } from './dtos/roomCreateRequest.dto';
import { GetQuestionRequest } from './dtos/getQuestionRequest.dto';
import { QuestionDto } from '../question/dtos/question.dto';
import { QuestionResult } from '../question/dtos/questionResult.dto';
import { RoomRequest } from './dtos/roomRequest.dto';
import { JoinRoomRequest } from './dtos/joinRoomRequest.dto copy';
import { KickRequest } from './dtos/kickRequest.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: Room })
  async get(): Promise<Room[]> {
    return this.roomService.getRooms();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: QuestionDto })
  async getQuestionById(@Param() { id }: FindOneParams): Promise<Room> {
    return this.roomService.findById(id);
  }

  @Post('rooms/create-room')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: RoomCreateRequest })
  @Roles(UserRole.USER)
  async createRoom(@CurrentUser() user: User, @Body() body: RoomCreateRequest): Promise<Room> {
    return this.roomService.createRoom(body, user);
  }

  @Post('rooms/answer-question')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: AnswerRequest })
  @Roles(UserRole.USER)
  async AnswerQuestion(@CurrentUser() user: User, @Body() data: AnswerRequest): Promise<any> {
    return this.roomService.answerQuestion(user, data);
  }

  @Post('rooms/get-question')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: GetQuestionRequest })
  @Roles(UserRole.USER)
  async GetQuestion(@Body() body: GetQuestionRequest): Promise<QuestionDto> {
    return this.roomService.getQuestion(body);
  }

  @Post('rooms/quickplay')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: Room })
  @Roles(UserRole.USER)
  async Quickplay(@CurrentUser() user: User): Promise<Room> {
    return this.roomService.quickplay(user);
  }

  @Post('rooms/get-question-result')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: QuestionResult })
  @ApiBody({ type: GetQuestionRequest })
  @Roles(UserRole.USER)
  async GetQuestionResult(@Body() data: GetQuestionRequest): Promise<QuestionResult> {
    return this.roomService.getResult(data);
  }

  @Post('rooms/left-room')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: QuestionResult })
  @ApiBody({ type: RoomRequest })
  @Roles(UserRole.USER)
  async leftRoom(@CurrentUser() user: User, @Body() body: RoomRequest): Promise<void> {
    this.roomService.leftRoom(user, body.roomId);
  }

  @Post('rooms/join-room')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: QuestionResult })
  @ApiBody({ type: JoinRoomRequest })
  @Roles(UserRole.USER)
  async joinRoom(@CurrentUser() user: User, @Body() body: JoinRoomRequest): Promise<Room> {
    return this.roomService.checkJoinRoom(body.roomId, user, body.password);
  }

  @Post('rooms/get-help-question')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: 'string[]' })
  @ApiBody({ type: RoomRequest })
  @Roles(UserRole.USER)
  async getHelpQuestion(@CurrentUser() user: User, @Body() body: RoomRequest): Promise<string[]> {
    return this.roomService.getHelpQuestion(user, body.roomId);
  }

  @Post('rooms/get-save-question')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: RoomRequest })
  @Roles(UserRole.USER)
  async getSaveQuestion(@CurrentUser() user: User, @Body() body: RoomRequest): Promise<void> {
    await this.roomService.getSaveQuestion(user, body.roomId);
  }

  @Post('rooms/kick-user')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: KickRequest })
  @Roles(UserRole.USER)
  async kickUser(@Body() body: KickRequest): Promise<void> {
    await this.roomService.kickUserInRoom(body.roomId, body.userId);
  }

  @Post('rooms/check-old-room')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async checkOldRoom(@CurrentUser() user: User): Promise<void> {
    await this.roomService.checkOldRoom(user);
  }
}
