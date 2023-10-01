import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'database/entities/question.entity';
import { QuestionService } from './question.service';
import { QuestionListener } from './question.listener';
import { QuestionController } from './question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionListener],
  exports: [QuestionService],
})
export class QuestionModule {}
