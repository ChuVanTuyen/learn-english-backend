import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Request } from '@nestjs/common';
import { CreateNotebookDto, UpdateNotebookDto } from './dto/create-notebook.dto';
import { NotebookService } from './notebook.service';
import { CreateNotebookWordDto, UpdateNotebookWordDto } from './dto/create-notebook-word.dto';
import { Public } from 'src/decorator/auth-metadata';

@Controller('notebook')
export class NotebookController {

    constructor(
        private notebookService: NotebookService
    ) { }

    @Get()
    async getListNotebook(
        @Request() req
    ) {
        return this.notebookService.getUserNotebooks(req.user.userId);
    }

    @Post('create')
    async createNotebooke(
        @Body() newNote: CreateNotebookDto,
        @Request() req
    ) {
        return this.notebookService.createNotebook(newNote, req.user.userId);
    }

    @Put('update')
    async updateNotebooke(
        @Body() updateNote: UpdateNotebookDto
    ) {
        return this.notebookService.updateNotebook(updateNote);
    }

    @Delete(':id')
    async deleteNotebook(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notebookService.deleteNotebook(id);
    }

    @Post(':notebookId/add-word')
    async addWordToNotebook(
        @Request() req,
        @Param('notebookId', ParseIntPipe) notebookId: number,
        @Body() createNotebookWordDto: CreateNotebookWordDto,
    ) {
        return this.notebookService.addWordToNotebook(req.user.userId, createNotebookWordDto, notebookId);
    }

    @Post('edit-word/:idWord')
    async editWordNotebook(
        @Request() req,
        @Param('idWord', ParseIntPipe) idWord: number,
        @Body() updateNotebookWordDto: Partial<CreateNotebookWordDto>,
    ) {
        return this.notebookService.updateWordInNotebook(req.user.userId, idWord, updateNotebookWordDto);
    }

    @Patch(':notebookId/update-word/:wordId')
    async updateNotebookWord(
        @Request() req,
        @Param('notebookId', ParseIntPipe) notebookId: number,
        @Param('wordId', ParseIntPipe) wordId: number,
        @Body() updateNotebookWordDto: UpdateNotebookWordDto,
    ) {
        return this.notebookService.updateNotebookWord(req.user.userId, notebookId, wordId, updateNotebookWordDto);
    }

    @Patch(':sourceNotebookId/move-words/:targetNotebookId')
    async moveWordsToNotebook(
        @Request() req,
        @Param('sourceNotebookId', ParseIntPipe) sourceNotebookId: number,
        @Param('targetNotebookId', ParseIntPipe) targetNotebookId: number,
        @Body('wordIds') wordIds: number[],
    ) {
        return this.notebookService.moveWordsToNotebook(req.user.userId, wordIds, sourceNotebookId, targetNotebookId);
    }

    @Public()
    @Get('auto')
    async getNotebookAuto() {
        return this.notebookService.getUserNotebooks(2);
    }

    @Get('user')
    async getNotebookUser(
        @Request() req
    ) {
        return this.notebookService.getUserNotebooks(req.user.userId);
    }

    @Get(':id')
    async getDetailNotebook(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notebookService.getNotebookWithWords(id);
    }

    @Delete('word/:id')
    async deleteWord(
        @Request() req,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notebookService.deleteWord(id);
    }

    // @Public()
    // @Get('insert-notebook-auto')
    // async createNotebookAuto() {
    //     return this.notebookService.createNotebooksFromFolder();
    // }
}
