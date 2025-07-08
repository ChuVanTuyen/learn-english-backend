import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Part } from 'src/database/entities/part.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { SummaryPractice } from 'src/database/entities/summary-practice.entity';
import { HistoryPractice } from 'src/database/entities/history-practice.entity';
import { ChildrenQues } from 'src/database/entities/child-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Part, Exam, SummaryPractice, HistoryPractice, ChildrenQues])
  ],
  controllers: [PracticeController],
  providers: [PracticeService]
})
export class PracticeModule {}
