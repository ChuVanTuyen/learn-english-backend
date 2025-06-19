import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import { Exam } from 'src/database/entities/exam.entity';
import { CreateHistoryExamDto } from './dto/history-exam.dto';
import { HistoryExam } from 'src/database/entities/history-exam.entity';

@Injectable()
export class ExamService {

    private readonly logger = new Logger(ExamService.name);
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
         @InjectRepository(HistoryExam)
        private readonly historyExamRepository: Repository<HistoryExam>,
    ) { }

    async getDetailExam(id: number) {
        // B1: Lấy tất cả câu hỏi theo exam_id kèm part và skill
        const questions = await this.questionRepository.find({
            where: { exam_id: id },
            relations: ['part', 'part.skill', 'exam', 'child_ques'],
            order: {
                part: { id: 'ASC' },
                child_ques: { order_idx: 'ASC' },
                order_idx: 'ASC',
            },
        });

        // return questions;

        if (!questions.length) {
            throw new NotFoundException('Không tìm thấy đề thi');
        }

        // B2: Lấy thông tin exam từ câu hỏi đầu tiên
        const exam = questions[0].exam;

        // B3: Group theo Skill → Part → Question
        const skillsMap = new Map<number, any>();

        for (const q of questions) {
            const skill = q.part.skill;
            const part = q.part;

            if (!skillsMap.has(skill.id)) {
                skillsMap.set(skill.id, {
                    id: skill.id,
                    name: skill.name,
                    type: skill.type,
                    time: skill.time,
                    is_listening: skill.is_listening,
                    parts: [],
                });
            }

            const skillGroup = skillsMap.get(skill.id);
            let partGroup = skillGroup.parts.find((p) => p.id === part.id);
            if (!partGroup) {
                partGroup = {
                    id: part.id,
                    name: part.name,
                    title: part['title'], // Nếu có
                    amount: 0,
                    questions: [],
                };
                skillGroup.parts.push(partGroup);
            }

            partGroup.questions.push({
                id: q.id,
                title: q.title,
                order_idx: q.order_idx,
                audio: q.audio,
                text_read: q.text_read,
                text_read_trans: q.text_read_trans,
                text_audio: q.text_audio,
                text_audio_trans: q.text_audio_trans,
                image: q.image,
                child_ques: q.child_ques
            });

            partGroup.amount = partGroup.questions.length;
        }

        // B4: Kết quả cuối cùng
        return {
            id: exam.id,
            name: exam.name,
            type: exam.type,
            time: exam.time,
            created_at: exam.created_at,
            updated_at: exam.updated_at,
            skills: Array.from(skillsMap.values()),
        };
    }

    async syncHistoryExam(historyDto: CreateHistoryExamDto, userId: number) {
        // Ghi log đầu vào
        this.logger.log(`Syncing history practice`);

        // Kiểm tra exam_id nếu có
        const exam = await this.examRepository.findOne({ where: { id: historyDto.exam_id } });
        if (!exam) {
            this.logger.warn(`Exam not found: ${historyDto.exam_id}`);
            throw new NotFoundException(`Exam with ID ${historyDto.exam_id} not found`);
        }

        try {
            const newHistory = this.historyExamRepository.create({
                ...historyDto,
                user_id: userId
            });
            const savedHistory = await this.historyExamRepository.save(newHistory);

            const response = {
                id: savedHistory.id,
                content: savedHistory.content,
                correct_listent: savedHistory.correct_listent,
                correct_read: savedHistory.correct_read,
                time: savedHistory.time,
                exam_id: savedHistory.exam_id,
                created_at: savedHistory.created_at,
                updated_at: savedHistory.updated_at,
            };

            this.logger.log(`History created successfully: ${savedHistory.id}`);
            return response;
        } catch (error) {
            this.logger.error(`Failed to sync history: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to save history');
        }
    }
}
