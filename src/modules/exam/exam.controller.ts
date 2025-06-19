import { Controller, Get, Param } from '@nestjs/common';
import { SeedService } from './seed/seed.service';
import { ExamService } from './exam.service';

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
}
