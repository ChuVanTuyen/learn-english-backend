import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { SeedService } from './seed/seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from 'src/database/entities/exam.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Part } from 'src/database/entities/part.entity';
import { Question } from 'src/database/entities/question.entity';
import { ChildrenQues } from 'src/database/entities/child-question.entity';
import { HistoryExam } from 'src/database/entities/history-exam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exam,
      Skill,
      Part,
      Question,
      ChildrenQues,
      HistoryExam
    ]),
  ],
  controllers: [ExamController],
  providers: [ExamService, SeedService]
})
export class ExamModule {}
