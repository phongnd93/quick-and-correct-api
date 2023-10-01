import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from 'database/enums';
import { Question, User } from 'database/entities';
import { PageDto, PageOptionsDto } from 'src/common/dtos';
import { FindOneParams } from 'database/dtos';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionService } from './question.service';
import { QuestionDto } from './dtos/question.dto';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { ApproveQuestionDto } from './dtos';
import { QuestionInfoDto } from './dtos/questionInfo.dto';
import { QuestionSearchDto } from './dtos/question-search.dto';
// import { DeleteQuestionDto } from './dtos/delete-question.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('')
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR, UserRole.EDITOR)
  @ApiResponse({ type: PageDto<QuestionDto>, status: 200 })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  async questions(
    @Query() pageOptions: QuestionSearchDto,
    @CurrentUser() user: User,
  ): Promise<PageDto<Question>> {
    return this.questionService.questions(pageOptions, user);
  }

  @Get('/pending')
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR, UserRole.EDITOR)
  @ApiResponse({ type: PageDto<QuestionDto>, status: 200 })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  async pendingQuestions(
    @Query() pageOptions: PageOptionsDto & QuestionSearchDto,
    @CurrentUser() user: User,
  ): Promise<PageDto<Question>> {
    return this.questionService.questions(pageOptions, user, true);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: QuestionDto })
  async getQuestionById(@Param() { id }: FindOneParams): Promise<QuestionDto> {
    return this.questionService.getQuestionById(id);
  }

  @Get('/info/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: QuestionDto })
  async getQuestioninfoById(@Param() { id }: FindOneParams): Promise<QuestionInfoDto> {
    const questionData = await this.questionService.getQuestionById(id);
    const result: QuestionInfoDto = questionData;
    return result;
  }

  @Post('')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.EDITOR, UserRole.CONTRIBUTOR, UserRole.ADMIN)
  // @ApiNoContentResponse()
  async create(
    @CurrentUser() userCurrent: User,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.createQuestion(createQuestionDto, userCurrent);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update question' })
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR, UserRole.EDITOR)
  @ApiBody({ type: UpdateQuestionDto })
  async update(
    @CurrentUser() userCurrent: User,
    @Param() { id }: FindOneParams,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<void> {
    return this.questionService.updateQuestion(userCurrent, id, updateQuestionDto);
  }

  @Post('/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve question' })
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR)
  async approve(@Body() { ids }: ApproveQuestionDto, @CurrentUser() user: User): Promise<void> {
    return this.questionService.approveQuestion(user, ids);
  }

  // For Admin delete user
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR)
  @ApiOperation({ summary: 'For Admin delete question' })
  @ApiBearerAuth('access-token')
  @ApiNoContentResponse()
  deleteQuestion(@Param('id') id: string): Promise<void> {
    return this.questionService.deleteQuestion(id);
  }

  // @Post('questions/create-dummy')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiBearerAuth('access-token')
  // @Roles(UserRole.EDITOR, UserRole.CONTRIBUTOR, UserRole.ADMIN)
  // // @ApiNoContentResponse()
  // async createdummydata(): Promise<void> {
  //   this.questionService.createQuestion([
  //     {
  //       content:
  //         'Bà Triệu (Triệu Thị Trinh) đã khởi nghĩa chống lại quân xâm lược Đông Ngô của Trung Quốc, Bà sinh ra ở đâu nếu căn cứ địa giới hành chính ngày nay?',
  //       star: 1,
  //       categoryId: 0,
  //       answerA: 'Nghệ An',
  //       answerB: 'Vĩnh Phúc',
  //       answerC: 'Thanh Hóa',
  //       answerD: 'Huế',
  //       questionType: 0,
  //       result: 3,
  //     },
  //     {
  //       content: 'Đỉnh núi cao nhất Việt Nam là?',
  //       star: 1,
  //       categoryId: 0,
  //       answerA: 'Tây Côn Lĩnh',
  //       answerB: 'Bạch Mã',
  //       answerC: 'Núi Bà Đen',
  //       answerD: 'Fansipan',
  //       questionType: 0,
  //       result: 4,
  //     },
  //   ]);
  // }
}
