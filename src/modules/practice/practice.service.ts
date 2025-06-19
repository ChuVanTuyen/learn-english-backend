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
            const savedHistory = await this.historyPracticeRepository.save(newHistory);

            const newSumaryPractice = {
                done_question_ids: summary.done_question_ids,
                false_question_ids: summary.false_question_ids,
                user_id: userId
            };

            const syncSummaryPractice = await this.summaryPracticeRepository.upsert(
                newSumaryPractice,
                ['user_id']
            )

            // Chuyển đổi sang DTO trả về
            const response = {
                history: {
                    id: savedHistory.id,
                    content: savedHistory.content,
                    total: savedHistory.total,
                    time: savedHistory.time,
                    correct: savedHistory.correct,
                    part_id: savedHistory.part_id,
                    created_at: savedHistory.created_at,
                    updated_at: savedHistory.updated_at,
                },
                summary: syncSummaryPractice
            };

            this.logger.log(`History created successfully: ${savedHistory.id}`);
            return response;
        } catch (error) {
            this.logger.error(`Failed to sync history: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to save history');
        }
    }
}
