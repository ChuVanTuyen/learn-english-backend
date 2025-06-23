import { Module } from '@nestjs/common';
import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notebook } from 'src/database/entities/notebook.entity';
import { NotebookWord } from 'src/database/entities/notebook-word.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        Notebook,
        NotebookWord
      ]),
    ],
  controllers: [NotebookController],
  providers: [NotebookService]
})
export class NotebookModule {}
