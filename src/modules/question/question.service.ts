import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { In, IsNull, ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { D2MBadRequestException, D2MNotFoundException } from 'src/common/infra-exception';
import { BaseService } from 'src/common/services';
import { Question } from 'database/entities/question.entity';
import { randomInt } from 'crypto';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/common/dtos';
import { User } from 'database/entities';
import { UserRole } from 'database/enums';
import { QuestionDto } from './dtos/question.dto';
import { QuestionResult } from './dtos/questionResult.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { QuestionSearchDto } from './dtos/question-search.dto';
// import { AuthService } from '../auth/auth.service';

@Injectable()
export class QuestionService extends BaseService<Question> {
  constructor(
    // @Inject(forwardRef(() => AuthService))
    // private readonly authService: AuthService,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {
    super(questionRepository);
  }

  async getQuestionById(questionId: string): Promise<QuestionDto> {
    // return this.questionRepository.findOne({ questionId });
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['userApprove', 'userCreated'],
    });

    if (!question) {
      throw new D2MNotFoundException('User not found');
    }

    return plainToInstance(QuestionDto, {
      ...question,
    });
  }

  async questionsForClient(
    pageOptionsDto: PageOptionsDto,
    rawQuery?: { where: string; parameters?: ObjectLiteral },
  ): Promise<PageDto<Question>> {
    try {
      const queryBuilder = this.questionRepository.createQueryBuilder('question');
      if (rawQuery) {
        queryBuilder.where(rawQuery.where, rawQuery?.parameters);
      }
      queryBuilder
        .leftJoinAndSelect('question.userCreated', 'userCreated')
        .leftJoinAndSelect('question.userApprove', 'userApprove')
        // .select(['question.id', 'question.content', 'userCreated'])
        // .addSelect(['userCreated.name'])
        .orderBy(`question.createdAt`, pageOptionsDto.sortDirection || 'DESC')
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take);

      const [entities, itemCount] = await queryBuilder.getManyAndCount();

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(entities, pageMetaDto);
    } catch (error: any) {
      throw new D2MBadRequestException(error.message || 'Invalid deals');
    }
  }

  async questions(
    pageOptionsDto: QuestionSearchDto,
    { viewGroups, role, id: userId }: User,
    isPending: boolean = false,
  ): // rawQuery?: { where: string; parameters?: ObjectLiteral },
  Promise<PageDto<Question>> {
    try {
      const queryBuilder = this.questionRepository.createQueryBuilder('question');
      if (isPending) {
        queryBuilder.where('question.approvedBy IS NULL');
      }
      if (pageOptionsDto.questionType !== 'all') {
        queryBuilder.andWhere('question.questionType = :questionType', {
          questionType: pageOptionsDto.questionType,
        });
      }
      if (pageOptionsDto.category !== 'all') {
        queryBuilder.andWhere('question.categoryId = :categoryId', {
          categoryId: pageOptionsDto.category,
        });
      }
      if (pageOptionsDto.q) {
        queryBuilder.andWhere('question.content like :name', { name: `%${pageOptionsDto.q}%` });
      }
      queryBuilder
        .leftJoinAndSelect('question.userCreated', 'userCreated')
        .leftJoinAndSelect('question.userApprove', 'userApprove');
      if (pageOptionsDto.createdBy !== 'all') {
        queryBuilder.andWhere('question.createdBy = :id', {
          id: pageOptionsDto.createdBy,
        });
      }
      if (role !== UserRole.ADMIN) {
        if (!viewGroups.length) {
          queryBuilder.andWhere('question.createdBy = :id', {
            id: userId,
          });
        } else {
          queryBuilder.andWhere(
            'userCreated.belongGroup IN (:...ids) OR question.createdBy = :id',
            {
              ids: viewGroups,
              id: userId,
            },
          );
        }
      }
      queryBuilder
        .orderBy(`question.createdAt`, pageOptionsDto.sortDirection || 'DESC')
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take);

      const [entities, itemCount] = await queryBuilder.getManyAndCount();

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(entities, pageMetaDto);
    } catch (error: any) {
      throw new D2MBadRequestException(error.message || 'Invalid deals');
    }
  }

  async updateQuestion(
    { viewGroups, role, id: userId }: User,
    id: string,
    data: UpdateQuestionDto,
  ): Promise<void> {
    if (role !== UserRole.ADMIN) {
      const question = await this.findById(id, ['userCreated']);
      if (!question) {
        throw new D2MNotFoundException('Question not found');
      }
      const {
        userCreated: { belongGroup, id: userCreatedId },
      } = question;
      if (!viewGroups.includes(belongGroup) && userId !== userCreatedId) {
        throw new D2MBadRequestException('Invalid permission');
      }
    }
    const questionUpdated = await this.update(id, data);
    if (!questionUpdated) {
      throw new D2MBadRequestException('Failed, cant update question');
    }
  }

  async approveQuestion({ viewGroups, role, id: userId }: User, ids: string[]): Promise<void> {
    if (role !== UserRole.ADMIN) {
      if (!viewGroups.length) {
        throw new D2MBadRequestException('Invalid permission');
      }
      const questions = await this.questionRepository
        .createQueryBuilder('question')
        .leftJoinAndSelect('question.userCreated', 'userCreated')
        .where('question.id IN (:...ids)', { ids })
        .andWhere('question.approvedBy IS NULL')
        .andWhere('userCreated.belongGroup IN (:...viewGroups) OR question.createdBy = :userId', {
          viewGroups,
          userId,
        })
        .getMany();
      if (!questions || questions.length !== ids.length) {
        throw new D2MBadRequestException('Invalid permission');
      }
    }

    const updated = await this.questionRepository.update(
      {
        id: In(ids),
        approvedBy: IsNull(),
      },
      { approvedBy: userId, approveDate: new Date() },
    );
    if (updated.affected === 0) {
      throw new D2MBadRequestException('Failed, question not found or approved');
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    const result = await this.questionRepository.delete(id);
    if (result.affected === 0) {
      throw new D2MNotFoundException(`Can not delete, user does not exist`);
    }
  }

  // async deleteQuestion(user: User, password: string): Promise<void> {
  //   const validatedUser = await this.authService.validateUser(user.email, password);
  //   if (!validatedUser) {
  //     throw new D2MBadRequestException('Wrong password');
  //   }
  //   const result = await this.questionRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new D2MNotFoundException(`Can not delete, user does not exist`);
  //   }
  // }

  async findByIdOrFail(id: string): Promise<Question> {
    return this.questionRepository.findOneByOrFail({ id });
  }

  async createQuestion(data: CreateQuestionDto, user: User): Promise<Question> {
    const params = {} as any;
    params.createdBy = user.id;
    if (user.role === UserRole.ADMIN) {
      params.approvedBy = user.id;
      params.approveDate = new Date();
    }
    const question = await this.create({ ...data, ...params });
    if (!question) {
      throw new D2MBadRequestException('Failed, cant update question');
    }
    return question;
  }

  async GetQuestionById(id: string): Promise<QuestionDto> {
    const question = await this.findById(id);

    if (question) {
      const res = new QuestionDto();
      res.id = question.id;
      res.answerA = question.answerA;
      res.answerB = question.answerB;
      res.answerC = question.answerC;
      res.answerD = question.answerD;
      res.content = question.content;
      res.questionType = question.questionType;
      res.star = question.star;
      res.users = [];
      res.imageUrl = question.imageUrl;
      res.result = question.result;
      return res;
    }
    throw new D2MBadRequestException('Question not found');
  }

  async GetQuestion(categoryId: string): Promise<QuestionDto> {
    const listQuestion = (await this.findAll()).filter(
      (x) => x.active && x.approved && x.categoryId === categoryId,
    );
    const randonIndex = randomInt(0, listQuestion.length);
    const question = listQuestion[randonIndex];
    const res = new QuestionDto();
    res.id = question.id;
    res.answerA = question.answerA;
    res.answerB = question.answerB;
    res.answerC = question.answerC;
    res.answerD = question.answerD;
    res.content = question.content;
    res.questionType = question.questionType;
    res.star = question.star;
    res.users = [];
    res.imageUrl = question.imageUrl;
    res.result = question.result;
    return res;
  }

  async GetRandomQuestion(categoryId: string): Promise<QuestionDto> {
    const questions = (await this.findAll()).filter((x) => x.categoryId === categoryId);
    if (questions && questions.length > 0) {
      const random = randomInt(0, questions.length - 1);
      const res = new QuestionDto();
      res.id = questions[random].id;
      res.answerA = questions[random].answerA;
      res.answerB = questions[random].answerB;
      res.answerC = questions[random].answerC;
      res.answerD = questions[random].answerD;
      res.content = questions[random].content;
      res.questionType = questions[random].questionType;
      res.star = questions[random].star;
      res.imageUrl = questions[random].imageUrl;
      res.users = [];
      return res;
    }
    throw new Error('Cannot find questTion');
  }

  async GetRandomQuestionId(categoryId: string): Promise<string> {
    const questions = (await this.findAll()).filter((x) => x.categoryId === categoryId);
    if (questions && questions.length > 0) {
      const random = randomInt(0, questions.length - 1);
      return questions[random].id;
    }

    throw new Error('Cannot find question');
  }

  async GetQuestioResult(questionId: string): Promise<QuestionResult> {
    const question = await this.questionRepository.findOneByOrFail({ id: questionId });
    const res = new QuestionResult();
    res.result = question.result;
    return res;
  }
}
