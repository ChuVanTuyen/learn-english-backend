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
    async getListQuestion(@Param('id') id: number, @Param('count') count: number) {
        return this.practiceService.getListQuestion(id, count);
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
}
