import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ebook } from 'src/database/entities/ebook.entity';
import { Repository } from 'typeorm';
import { CreateEbookDto } from './dto/create-ebook.dto';

@Injectable()
export class EbookService {

    constructor(
        @InjectRepository(Ebook)
        private readonly ebookRepo: Repository<Ebook>,
    ) { }

    async findAll(): Promise<Ebook[]> {
        return this.ebookRepo.find({
            order: {
                created_at: 'DESC',
            },
        });
    }

    async getEbookById(id: number) {
        const book = await this.ebookRepo.findOneBy({ id });
        return book;
    }

    async create(createEbookDto: CreateEbookDto): Promise<Ebook> {
        const ebook = this.ebookRepo.create(createEbookDto);
        return this.ebookRepo.save(ebook);
    } 
}
