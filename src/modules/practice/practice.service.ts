import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { In, Repository } from 'typeorm';
import { QuestionByIdsDto } from './dto/question-by-ids.dto';
import { Part } from 'src/database/entities/part.entity';
import { CreateHistoryPracticeDto } from './dto/history-practice.dto';
import { SummaryPractice } from 'src/database/entities/summary-practice.entity';
import { SumaryPracticeDto } from './dto/sumary-practice.dto';
import { HistoryPractice } from 'src/database/entities/history-practice.entity';
import e from 'express';

@Injectable()
export class PracticeService {

    private readonly logger = new Logger(PracticeService.name);
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Part)
        private readonly partRepository: Repository<Part>,
        @InjectRepository(SummaryPractice)
        private readonly summaryPracticeRepository: Repository<SummaryPractice>,
        @InjectRepository(HistoryPractice)
        private readonly historyPracticeRepository: Repository<HistoryPractice>
    ) { }

    async getListQuestion(partId: number, count: number, userId: number) {
        const summary = await this.summaryPracticeRepository.findOne({ where: { user_id: userId } });

        const excludeIds = summary?.done_questions?.[partId] || [];

        // 1. Lấy ngẫu nhiên các câu CHƯA làm
        const queryBuilder = this.questionRepository
            .createQueryBuilder('question')
            .where('question.part_id = :partId', { partId });

        if (excludeIds.length > 0) {
            queryBuilder.andWhere('question.id NOT IN (:...excludeIds)', { excludeIds });
        }

        const primaryQuestions = await queryBuilder
            .orderBy('RAND()')
            .limit(count)
            .getMany();

        let totalQuestions = [...primaryQuestions];

        // 2. Nếu chưa đủ, lấy thêm từ danh sách đã làm (để bù)
        if (totalQuestions.length < count && excludeIds.length > 0) {
            const missingCount = count - totalQuestions.length;

            const extraQuestions = await this.questionRepository
                .createQueryBuilder('question')
                .where('question.part_id = :partId', { partId })
                .andWhere('question.id IN (:...includeIds)', { includeIds: excludeIds })
                .orderBy('RAND()')
                .limit(missingCount)
                .getMany();

            totalQuestions = [...totalQuestions, ...extraQuestions];
        }

        // 3. Lấy đầy đủ child_ques
        const questionIds = totalQuestions.map(q => q.id);

        const questionsWithChildren = await this.questionRepository.find({
            where: { id: In(questionIds) },
            relations: ['child_ques'],
        });

        for (const q of questionsWithChildren) {
            q.child_ques = q.child_ques.sort((a, b) => a.order_idx - b.order_idx);
        }

        return questionsWithChildren;
    }

    async getRandomQuestionsFailed(partId: number, count: number, userId: number) {
        const summary = await this.summaryPracticeRepository.findOne({ where: { user_id: userId } });

        const questionIds = summary?.done_questions?.[partId] || [];
        if (!questionIds || questionIds.length === 0) {
            return [];
        }

        const randomQuestions = await this.questionRepository
            .createQueryBuilder('question')
            .where('question.part_id = :partId', { partId })
            .andWhere('question.id IN (:...ids)', { ids: questionIds })
            .orderBy('RAND()')
            .limit(count)
            .getMany();

        const fullQuestions = await this.questionRepository.find({
            where: { id: In(randomQuestions.map(q => q.id)) },
            relations: ['child_ques'],
        });

        for (const q of fullQuestions) {
            q.child_ques = q.child_ques.sort((a, b) => a.order_idx - b.order_idx);
        }

        return fullQuestions;
    }


    async getListQuestionByIds(quesByIdsDto: QuestionByIdsDto) {
        return await this.questionRepository.find({
            where: { id: In(quesByIdsDto.ids) },
            relations: ['child_ques'],
            order: {
                child_ques: {
                    order_idx: 'ASC',
                }
            },
        });
    }

    async syncHistoryPractice(history: CreateHistoryPracticeDto, summary: SumaryPracticeDto, userId: number) {
        const part = await this.partRepository.findOne({ where: { id: history.part_id } });
        if (!part) {
            throw new NotFoundException(`Part with ID ${history.part_id} not found`);
        }

        try {
            const newHistory = this.historyPracticeRepository.create({
                ...history,
                user_id: userId
            });

            console.log(newHistory);
            await this.historyPracticeRepository.save(newHistory);

            const newSumaryPractice = {
                done_questions: summary.done_questions,
                false_questions: summary.false_questions,
                user_id: userId
            };

            await this.summaryPracticeRepository.upsert(
                newSumaryPractice,
                ['user_id']
            );
            return 'Save history successfully';
        } catch (error) {
            console.log(error);
            throw new BadRequestException('Failed to save history');
        }
    }

    async getSummaryPractice(userId: number, partId: number) {
        const summary = await this.summaryPracticeRepository.findOne({ where: { user_id: userId } });
        const history = await this.historyPracticeRepository.find({ 
            where: { user_id: userId , part_id: partId},
            order: {
                created_at: 'DESC'
            },
            take: 10
        });
        return {
            summary: summary,
            history: history
        };
    }
}
