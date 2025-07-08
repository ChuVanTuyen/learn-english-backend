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
        private readonly questionRepo: Repository<Question>,
        @InjectRepository(Exam)
        private readonly examRepo: Repository<Exam>,
        @InjectRepository(HistoryExam)
        private readonly historyExamRepo: Repository<HistoryExam>,
    ) { }

    async getDetailExam(id: number) {
        // B1: Lấy tất cả câu hỏi theo exam_id kèm part và skill
        const questions = await this.questionRepo.find({
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

    async syncHistoryExam(historyDto: CreateHistoryExamDto, userId: number, exam_id: number) {
        // Kiểm tra exam_id nếu có
        const exam = await this.examRepo.findOne({ where: { id: exam_id } });
        if (!exam) {
            this.logger.warn(`Exam not found: ${exam_id}`);
            throw new NotFoundException(`Exam with ID ${exam_id} not found`);
        }

        try {
            const newHistory = this.historyExamRepo.create({
                ...historyDto,
                user_id: userId,
                exam_id
            });
            const savedHistory = await this.historyExamRepo.save(newHistory);

            const response = {
                id: savedHistory.id,
                content: savedHistory.content,
                correct_listen: savedHistory.correct_listen,
                correct_read: savedHistory.correct_read,
                time: savedHistory.time,
                exam_id: savedHistory.exam_id,
                created_at: savedHistory.created_at,
                updated_at: savedHistory.updated_at,
            };
            return response;
        } catch (error) {
            throw new BadRequestException('Failed to save history');
        }
    }

    async getExamsAndHistoryByUserId(user_id?: number) {
        const exams = await this.examRepo.find();
        if(user_id) {
            const historyExams = await this.historyExamRepo.find({
                where: { user_id },
                order: { created_at: 'DESC' },
            });    
            return exams.map(exam => ({
                ...exam,
                histories: historyExams.filter(history => history.exam_id === exam.id),
            }));
        } else {
            return exams;
        }

    }

    async getDetailHistory(user_id: number, historyId: number) {
        try {
            const detailHistory = await this.historyExamRepo.findOne({
                where: {user_id, id: historyId}
            });
            return detailHistory;
        } catch (error) {
            throw new BadRequestException('Lấy lịch sử thất bại');
        }
    }
}
