import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EbookService } from './ebook.service';
import { Public } from 'src/decorator/auth-metadata';
import { CreateEbookDto } from './dto/create-ebook.dto';

@Controller('ebook')
export class EbookController {

    constructor(
        private ebookService: EbookService
    ) {}

    @Public()
    @Get('')
    async getListEbook() {
        return this.ebookService.findAll();
    }

    @Public()
    @Get(':id')
    async getDetailEbook(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.ebookService.getEbookById(id);
    }

    @Public()
    @Post('insert')
    async create(@Body() createEbookDto: CreateEbookDto) {
        return this.ebookService.create(createEbookDto);
    }
}
