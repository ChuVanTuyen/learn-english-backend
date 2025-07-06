import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { QuestionByIdsDto } from './dto/question-by-ids.dto';
import { SumaryPracticeDto } from './dto/sumary-practice.dto';
import { CreateHistoryPracticeDto } from './dto/history-practice.dto';

@Controller('practice')
export class PracticeController {
    
    constructor(
        private practiceService: PracticeService
    ) {}

    @Get('list-question/:id/:count')
    async getListQuestion(
        @Param('id') id: number, 
        @Param('count') count: number,
        @Request() req
    ) {
        return this.practiceService.getListQuestion(id, count, req.user.userId);
    }

    @Get('list-question-failed/:id/:count')
    async getRandQuesFailed(
        @Param('id') id: number, 
        @Param('count') count: number,
        @Request() req
    ) {
        return this.practiceService.getRandomQuestionsFailed(id, count, req.user.userId);
    }

    @Post('list-question-ids')
    async getListQuestionByIds(@Body() req: QuestionByIdsDto) {
        return this.practiceService.getListQuestionByIds(req);
    }

    @Post('save-history')
    async saveHistory(
        @Body('history') history: CreateHistoryPracticeDto,
        @Body('summary') summary: SumaryPracticeDto,
        @Request() req
    ) {
        return this.practiceService.syncHistoryPractice(history, summary, req.user.userId);
    }

    @Get('summary-history-practice/:partId')
    async getSummaryPractice(@Request() req, @Param('partId') partId: number) {
        return this.practiceService.getSummaryPractice(req.user.userId, partId);
    }


}
