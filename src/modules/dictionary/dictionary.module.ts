import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Antonym } from 'src/database/entities/antonym.entity';
import { ContentWord } from 'src/database/entities/content-word.entity';
import { Example } from 'src/database/entities/example.entity';
import { Idiom } from 'src/database/entities/idiom.entity';
import { KindContent } from 'src/database/entities/kind-content.entity';
import { Synonym } from 'src/database/entities/synonym.entity';
import { Word } from 'src/database/entities/word.entity';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Word,
            ContentWord,
            KindContent,
            Synonym,
            Antonym,
            Example,
            Idiom
        ]),
    ],
    controllers: [DictionaryController],
    providers: [
        DictionaryService,
        
    ],
})
export class DictionaryModule { }
