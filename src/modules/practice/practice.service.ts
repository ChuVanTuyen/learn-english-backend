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

    async getListQuestion(partId: number, count: number) {
        const questions = await this.questionRepository
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.child_ques', 'child')
            .where('question.part_id = :partId', { partId })
            .orderBy('RAND()')
            .limit(count)
            .getMany();

        for (const q of questions) {
            q.child_ques = q.child_ques.sort((a, b) => a.order_idx - b.order_idx);
        }

        return questions;
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
        // Ghi log đầu vào
        this.logger.log(`Syncing history practice`);

        // Kiểm tra part_id nếu có
        const part = await this.partRepository.findOne({ where: { id: history.part_id } });
        if (!part) {
            this.logger.warn(`Part not found: ${history.part_id}`);
            throw new NotFoundException(`Part with ID ${history.part_id} not found`);
        }

        try {
            // Tạo bản ghi history với user_id từ token
            const newHistory = this.historyPracticeRepository.create({
                ...history,
                user_id: userId
            });
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
