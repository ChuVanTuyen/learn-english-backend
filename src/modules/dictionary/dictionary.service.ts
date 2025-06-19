import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';
import { Antonym } from 'src/database/entities/antonym.entity';
import { ContentWord } from 'src/database/entities/content-word.entity';
import { Example } from 'src/database/entities/example.entity';
import { Idiom } from 'src/database/entities/idiom.entity';
import { KindContent } from 'src/database/entities/kind-content.entity';
import { Synonym } from 'src/database/entities/synonym.entity';
import { Word } from 'src/database/entities/word.entity';

// Định nghĩa interface cho dữ liệu JSON
interface WordDto {
    word: string;
    pronounce: string;
    synonyms: string[];
    antonyms: string[];
    content: {
        kind: string;
        kind_content: {
            means: string;
            examples: { example: string; mean: string }[];
        }[];
        idioms: { idiom: string; mean: string }[];
    }[];
}

@Injectable()
export class DictionaryService {
    constructor(
        @InjectRepository(Word) private wordRepository: Repository<Word>,
        @InjectRepository(Synonym) private synonymRepository: Repository<Synonym>,
        @InjectRepository(Antonym) private antonymRepository: Repository<Antonym>,
        @InjectRepository(ContentWord) private contentWordRepository: Repository<ContentWord>,
        @InjectRepository(KindContent) private kindContentRepository: Repository<KindContent>,
        @InjectRepository(Example) private exampleRepository: Repository<Example>,
        @InjectRepository(Idiom) private idiomRepository: Repository<Idiom>,
    ) { }

    async importWordsFromJsonFolder(folderPath: string) {
        try {
            // Đảm bảo folderPath là đường dẫn tuyệt đối
            const absolutePath = path.resolve(folderPath);

            // Sử dụng glob để lấy danh sách tất cả file JSON
            const files = glob.sync(`${absolutePath}/*.json`);

            if (files.length === 0) {
                throw new Error('No JSON files found in the specified folder');
            }

            console.log(`Found ${files.length} JSON files`);

            // Lặp qua từng file JSON
            for (const file of files) {
                try {
                    // Đọc nội dung file JSON
                    const fileContent = await fs.readFile(file, 'utf-8');
                    const wordData: WordDto = JSON.parse(fileContent);

                    // ✅ Kiểm tra từ đã tồn tại chưa
                    const isExist = await this.wordRepository.findOne({ where: { word: wordData.word } });
                    if (isExist) {
                        console.log(`Skipped duplicate word: ${wordData.word}`);
                        continue;
                    }
                    // Lưu dữ liệu vào database
                    await this.saveWord(wordData);
                    console.log(`Successfully imported word: ${wordData.word} from ${file}`);
                } catch (error) {
                    console.error(`Error processing file ${file}:`, error);
                    // Tiếp tục với file tiếp theo nếu có lỗi
                }
            }
            return 'done';
        } catch (error) {
            console.error('Error importing JSON files:', error);
            throw error;
        }

    }

async saveWord(wordData: WordDto): Promise<Word> {
    // 1. Lưu Word chính
    const word = new Word();
    word.word = wordData.word;
    word.pronounce = wordData.pronounce;
    const savedWord = await this.wordRepository.save(word);

    // 2. Lưu Synonyms
    if (wordData.synonyms?.length) {
        const synonyms = wordData.synonyms.map(syn => {
            const synonym = new Synonym();
            synonym.synonym = syn;
            synonym.word = savedWord;
            return synonym;
        });
        await this.synonymRepository.save(synonyms);
    }

    // 3. Lưu Antonyms
    if (wordData.antonyms?.length) {
        const antonyms = wordData.antonyms.map(ant => {
            const antonym = new Antonym();
            antonym.antonym = ant;
            antonym.word = savedWord;
            return antonym;
        });
        await this.antonymRepository.save(antonyms);
    }

    // 4. Lưu nội dung (content[])
    if (wordData.content?.length) {
        for (const cont of wordData.content) {
            // 4.1 Lưu ContentWord
            const contentWord = new ContentWord();
            contentWord.kind = cont.kind;
            contentWord.word = savedWord;
            const savedContentWord = await this.contentWordRepository.save(contentWord);

            // 4.2 Lưu KindContent[]
            if (cont.kind_content?.length) {
                for (const kc of cont.kind_content) {
                    const kindContent = new KindContent();
                    kindContent.means = kc.means;
                    kindContent.contentWord = savedContentWord;

                    const savedKindContent = await this.kindContentRepository.save(kindContent);

                    // 4.3 Lưu Examples của KindContent
                    if (kc.examples?.length) {
                        const examples = kc.examples.map(ex => {
                            const example = new Example();
                            example.example = ex.example;
                            example.mean = ex.mean;
                            example.kindContent = savedKindContent;
                            return example;
                        });
                        await this.exampleRepository.save(examples);
                    }
                }
            }

            // 4.4 Lưu Idioms[]
            if (cont.idioms?.length) {
                const idioms = cont.idioms.map(idm => {
                    const idiom = new Idiom();
                    idiom.idiom = idm.idiom;
                    idiom.mean = idm.mean;
                    idiom.contentWord = savedContentWord;
                    return idiom;
                });
                await this.idiomRepository.save(idioms);
            }
        }
    }

    return savedWord;
}


    async searchWords(query: string, limit: number): Promise<any[]> {
        // Tách câu thành mảng các từ, loại bỏ dấu câu và chuẩn hóa
        const wordsInQuery = query
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Loại bỏ dấu câu
            .split(/\s+/)
            .filter(word => word.length > 0); // Loại bỏ từ rỗng

        // Nếu không có từ nào, trả về mảng rỗng
        if (wordsInQuery.length === 0) {
            return [];
        }

        // Tạo điều kiện tìm kiếm cho từng từ
        const conditions = wordsInQuery.map(word => ({
            word: ILike(`%${word}%`),
        }));

        // Tìm kiếm từ vựng dựa trên các từ trong câu
        const words = await this.wordRepository.find({
            where: conditions.length > 0 ? conditions : { word: ILike(`%${query}%`) }, // Fallback nếu không tách được từ
            take: limit,
            relations: [
                'synonyms',
                'antonyms',
                'contents',
                'contents.kindContents',
                'contents.kindContents.examples',
                'contents.idioms',
            ],
        });

        // Chuyển đổi kết quả thành định dạng mong muốn
        return words.map(word => ({
            word: word.word,
            pronounce: word.pronounce,
            synonyms: word.synonyms.map(s => s.synonym),
            antonyms: word.antonyms.map(a => a.antonym),
            content: word.contents.map(content => ({
                kind: content.kind,
                kind_content: content.kindContents.map(kindContent => ({
                    means: kindContent.means,
                    examples: kindContent.examples.map(ex => ({
                        example: ex.example,
                        mean: ex.mean,
                    })),
                })),
                idioms: content.idioms.map(idiom => ({
                    idiom: idiom.idiom,
                    mean: idiom.mean,
                })),
            })),
        }));
    }

    async suggestWord(query: string, limit: number): Promise<any[]> {
        const words = await this.wordRepository.find({
            where: { word: ILike(`%${query}%`) },
            take: limit,
            relations: [
                'contents',
                'contents.kindContents',
            ],
        });

        return words.map(word => ({
            word: word.word,
            pronounce: word.pronounce,
            content: word.contents.map(content => ({
                kind: content.kind,
                kind_content: content.kindContents.map(kindContent => ({
                    means: kindContent.means
                }))
            })),
        }));
    }

    async relatedWord(query: string, limit: number) {
        // Tách câu thành mảng các từ, loại bỏ dấu câu và chuẩn hóa
        const wordsInQuery = query
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Loại bỏ dấu câu
            .split(/\s+/)
            .filter(word => word.length > 0); // Loại bỏ từ rỗng

        // Nếu không có từ nào, trả về mảng rỗng
        if (wordsInQuery.length === 0) {
            return [];
        }

        // Tạo điều kiện tìm kiếm cho từng từ
        const conditions = wordsInQuery.map(word => ({
            word: ILike(`%${word}%`),
        }));

        // Tìm kiếm từ vựng dựa trên các từ trong câu
        const words = await this.wordRepository.find({
            where: conditions.length > 0 ? conditions : { word: ILike(`%${query}%`) }, // Fallback nếu không tách được từ
            take: limit,
            relations: [
                'contents',
                'contents.kindContents',
            ],
        });

        // Chuyển đổi kết quả thành định dạng mong muốn
        return words.map(word => ({
            word: word.word,
            pronounce: word.pronounce,
            content: word.contents.map(content => ({
                kind: content.kind,
                kind_content: content.kindContents.map(kindContent => ({
                    means: kindContent.means,
                })),
            })),
        }));
    }
}