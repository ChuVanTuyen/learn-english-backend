import { Module } from '@nestjs/common';
import { EbookController } from './ebook.controller';
import { EbookService } from './ebook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ebook } from 'src/database/entities/ebook.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Ebook
        ]),
    ],
    controllers: [EbookController],
    providers: [EbookService]
})
export class EbookModule {

}
