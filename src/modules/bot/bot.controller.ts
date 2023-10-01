import {
  Body,
  Get,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'database/enums';
import { User } from 'database/entities';
import { FindOneParams } from 'database/dtos';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { BotService } from './bot.service';
import { CurrentUser, Roles } from '../auth/decorators';
import { CreateBotRequest } from './dtos/createBot.dto';
import { UpdateBotDto } from './dtos/updateBot.dto';

@Controller('Bot')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update question' })
  @Roles(UserRole.ADMIN)
  @ApiBody({ type: UpdateBotDto })
  async update(
    @CurrentUser() userCurrent: User,
    @Param() { id }: FindOneParams,
    @Body() updateBotDto: UpdateBotDto,
  ): Promise<void> {
    return this.botService.updateBot(id, updateBotDto);
  }

  @Post('bots/create-bot')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateBotRequest })
  @Roles(UserRole.ADMIN)
  async createRoom(@Body() body: CreateBotRequest): Promise<void> {
    await this.botService.createBot(body);
  }

  @Get('AllBotId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ status: HttpStatus.OK, type: 'string' })
  async GetListBot(): Promise<string[]> {
    const listBot = await this.botService.findAll();
    return listBot.map((bot) => {
      return bot.id;
    });
  }
}
