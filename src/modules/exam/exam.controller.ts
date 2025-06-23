import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { ExamService } from './exam.service';
import { Public } from 'src/decorator/auth-metadata';
import { CreateHistoryExamDto } from './dto/history-exam.dto';
import { OptionalJwtGuard } from './passport/optional-jwt.guard';

@Controller('exam')
export class ExamController {

    constructor(
        private seedService: SeedService,
        private examService: ExamService
    ) {}

    // @Get('insert')
    // async insertDataExam() {
    //     return this.seedService.seedMultiQuestion();
    // }

    // @Get('change')
    // async handleDataExam() {
    //     return this.seedService.handleDataExam();
    // }

    @Get('detail/:id')
    async getDetailExam (@Param('id') id: number) {
        return this.examService.getDetailExam(id);
    }

    // exams.controller.ts
    @Public()
    @UseGuards(OptionalJwtGuard) 
    @Get()
    async getExamsAndHistoryByUserId(@Request() req) {
        return this.examService.getExamsAndHistoryByUserId(req.user?.userId);
    }

    @Post('detail/:id')
    async saveHistoryExame(
        @Param('id') examId: number,
        @Body() newHistory: CreateHistoryExamDto,
        @Request() req

    ) {
        return this.examService.syncHistoryExam(newHistory, req.user.userId, examId);
    }

    @Get('history/:id')
    async getDetailHistory(
        @Param('id') historyId: number,
        @Request() req
    ) {
        return this.examService.getDetailHistory(req.user.userId, historyId);
    }
}
