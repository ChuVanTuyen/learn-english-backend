import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/decorator/auth-metadata';
import { DictionaryService } from './dictionary.service';

@Controller('dictionary')
export class DictionaryController {

    constructor(
        private dictionaryService: DictionaryService,
    ) { }


    // @Public()
    // @Get('insert')
    // async insertWors() {
    //     return this.dictionaryService.importWordsFromJsonFolder('D:/datn/learn-english-data/output');
    // }

    @Public()
    @Get('search')
    async searchWords(
        @Query('q') query: string, 
        @Query('limit') limit: number
    ) {
        return this.dictionaryService.searchWords(query, limit);
    }

    @Public()
    @Get('suggest')
    async getSuggest(
        @Query('q') query: string, 
        @Query('limit') limit: number
    ) {
        return this.dictionaryService.suggestWord(query, limit);
    }

}
