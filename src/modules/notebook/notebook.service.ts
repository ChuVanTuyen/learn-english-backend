import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateNotebookDto, UpdateNotebookDto } from './dto/create-notebook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notebook } from 'src/database/entities/notebook.entity';
import { NotebookWord } from 'src/database/entities/notebook-word.entity';
import { In, Repository } from 'typeorm';
import { CreateNotebookWordDto, UpdateNotebookWordDto } from './dto/create-notebook-word.dto';
import { basename, join } from 'path';
import * as fs from 'fs/promises';

interface EmotionWord {
    id: number;
    word: string;
    pronounce: { us: string, gb: string };
    mean: { vi: string; en: string };
    word_id: { vi: string; en: string };
    category: string;
    type: string;
    level: string | null;
    created_at: string;
    updated_at: string;
}

interface EmotionData {
    current_page: number;
    data: EmotionWord[];
    total: number;
}

@Injectable()
export class NotebookService {

    constructor(
        @InjectRepository(Notebook) private notebookRepo: Repository<Notebook>,
        @InjectRepository(NotebookWord) private notebookWordRepo: Repository<NotebookWord>,
    ) { }

    async getUserNotebooks(user_id: number): Promise<Notebook[]> {
        try {
            // Lấy danh sách notebook của user
            const notebooks = await this.notebookRepo.find({
                where: { user_id },
                order: { created_at: 'DESC' }, // Sắp xếp theo thời gian tạo, mới nhất trước
            });

            return notebooks;
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy danh sách notebook');
        }
    }

    async createNotebook(newNotebookData: CreateNotebookDto, user_id: number) {
        try {
            // tạo notebook mới 
            const newNotebook = this.notebookRepo.create({
                ...newNotebookData,
                user_id,
            });

            const savedNotebook = await this.notebookRepo.save(newNotebook);
            return savedNotebook;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Tạo sổ tay thất bại');
        }
    }

    async updateNotebook(dataUpdate: UpdateNotebookDto) {
        try {
            // kiểm tra notebook tồn tại
            const notebook = await this.notebookRepo.findOne({ where: { id: dataUpdate.id } });
            if (!notebook) {
                throw new NotFoundException(`Không tìm thấy sổ tay`);
            }
            this.notebookRepo.merge(notebook, dataUpdate);
            const updatedNotebook = await this.notebookRepo.save(notebook);
            return updatedNotebook;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Update sổ tay thất bại');
        }
    }

    async addWordToNotebook(user_id: number, newWordDto: CreateNotebookWordDto, notebookId: number): Promise<NotebookWord> {
        try {
            // Kiểm tra notebook tồn tại và thuộc về user
            const notebook = await this.notebookRepo.findOne({
                where: { id: notebookId, user_id },
            });
            if (!notebook) {
                throw new NotFoundException(`Không tìm thấy notebook với ID ${notebookId} hoặc bạn không có quyền truy cập`);
            }

            // Tạo từ vựng mới
            const newWord = this.notebookWordRepo.create({
                ...newWordDto,
                notebook_id: notebook.id
            });

            // Lưu từ vựng
            const savedWord = await this.notebookWordRepo.save(newWord);

            // Cập nhật total của notebook
            notebook.total += 1;
            await this.notebookRepo.save(notebook);

            return savedWord;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi thêm từ vựng vào notebook');
        }
    }

    async deleteWord(id: number) {
        // Lấy từ cần xóa để biết notebook_id
        const word = await this.notebookWordRepo.findOne({ where: { id } });

        if (!word) {
            throw new NotFoundException(`NotebookWord with ID ${id} not found`);
        }

        // Xóa từ
        const result = await this.notebookWordRepo.delete(id);

        // Nếu xóa thành công, cập nhật lại total
        if (result.affected && result.affected > 0) {
            const notebook = await this.notebookRepo.findOne({ where: { id: word.notebook_id } });
            if (notebook && notebook.total > 0) {
                notebook.total -= 1;
                await this.notebookRepo.save(notebook);
            }
        }

        return { message: 'Từ đã được xóa thành công' };
    }


    async updateNotebookWord(userId: number, notebookId: number, wordId: number, updateWordDto: UpdateNotebookWordDto) {
        try {
            // Kiểm tra notebook và từ vựng tồn tại, và thuộc về user
            const word = await this.notebookWordRepo.findOne({
                where: { id: wordId, notebook_id: notebookId },
                relations: ['notebook'],
            });
            if (!word) {
                throw new NotFoundException(`Không tìm thấy từ vựng với ID ${wordId} trong notebook ${notebookId}`);
            }
            if (word.notebook.user_id !== userId) {
                throw new NotFoundException(`Bạn không có quyền chỉnh sửa từ vựng này`);
            }

            // Cập nhật từ vựng
            this.notebookWordRepo.merge(word, updateWordDto);
            const updatedWord = await this.notebookWordRepo.save(word);

            return {
                "id": updatedWord.id,
                "notebook_id": updatedWord.notebook_id,
                "word": updatedWord.word,
                "pronounce": updatedWord.pronounce,
                "kind": updatedWord.kind,
                "mean": updatedWord.mean,
                "note": updatedWord.note,
                "created_at": updatedWord.created_at,
                "updated_at": updatedWord.updated_at
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi cập nhật từ vựng');
        }
    }

    async moveWordsToNotebook(user_id: number, wordIds: number[], sourceNotebookId: number, targetNotebookId: number) {
        try {
            // Kiểm tra notebook nguồn và đích tồn tại, thuộc về user
            const [sourceNotebook, targetNotebook] = await Promise.all([
                this.notebookRepo.findOne({ where: { id: sourceNotebookId, user_id } }),
                this.notebookRepo.findOne({ where: { id: targetNotebookId, user_id } }),
            ]);

            if (!sourceNotebook) {
                throw new NotFoundException(`Không tìm thấy notebook nguồn với ID ${sourceNotebookId}`);
            }
            if (!targetNotebook) {
                throw new NotFoundException(`Không tìm thấy notebook đích với ID ${targetNotebookId} hoặc bạn không có quyền truy cập`);
            }
            if (sourceNotebookId === targetNotebookId) {
                throw new NotFoundException('Notebook nguồn và đích không được trùng nhau');
            }

            // Kiểm tra tất cả từ vựng tồn tại và thuộc notebook nguồn
            const words = await this.notebookWordRepo.find({
                where: { id: In(wordIds), notebook_id: sourceNotebookId },
                relations: ['notebook'],
            });

            if (words.length !== wordIds.length) {
                const foundIds = words.map(word => word.id);
                const missingIds = wordIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(`Không tìm thấy một số từ vựng: ${missingIds.join(', ')}`);
            }
            if (words.some(word => word.notebook.user_id !== user_id)) {
                throw new NotFoundException('Bạn không có quyền truy cập một số từ vựng');
            }

            // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
            return await this.notebookRepo.manager.transaction(async (transactionalManager) => {
                // Cập nhật notebookId cho tất cả từ vựng
                for (const word of words) {
                    word.notebook_id = targetNotebookId;
                    word.notebook = targetNotebook;
                }

                // Lưu tất cả từ vựng đã cập nhật
                const updatedWords = await transactionalManager.save(NotebookWord, words);

                // Cập nhật total của notebook nguồn và đích
                sourceNotebook.total = Math.max(0, sourceNotebook.total - words.length);
                targetNotebook.total += words.length;

                await transactionalManager.save(Notebook, sourceNotebook);
                await transactionalManager.save(Notebook, targetNotebook);

                return { message: 'Di chuyển từ vựng thành công' };
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi di chuyển các từ vựng sang notebook khác');
        }
    }

    async createNotebooksFromFolder(folderPath: string = 'src/modules/notebook/notebookauto') {
        try {
            const absolutePath = join(process.cwd(), folderPath);
            const files = await fs.readdir(absolutePath);
            const jsonFiles = files.filter((file) => file.endsWith('.json'));

            if (jsonFiles.length === 0) {
                throw new NotFoundException(`Không tìm thấy tệp JSON nào trong thư mục ${folderPath}`);
            }

            for (const file of jsonFiles) {
                try {
                    // Đọc và phân tích tệp JSON
                    const filePath = join(absolutePath, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const emotionData: EmotionData = JSON.parse(fileContent);

                    // Lấy tên notebook từ tên tệp (không bao gồm phần mở rộng)
                    const notebookName = basename(file, '.json');

                    // Tạo notebook
                    const notebookDto = {
                        user_id: 2,
                        name: notebookName,
                        total: emotionData.total,
                    };
                    const newNotebook = this.notebookRepo.create({
                        ...notebookDto
                    });
                    const savedNotebook = await this.notebookRepo.save(newNotebook);

                    // Thêm từ vào notebook
                    const notebookWords = emotionData.data.map((item) => ({
                        notebook_id: savedNotebook.id,
                        word: item.word,
                        pronounce: item.pronounce ? item.pronounce.us : undefined,
                        mean: item.mean.vi || ''
                    }));

                    const notebookWordEntities = this.notebookWordRepo.create(notebookWords);
                    await this.notebookWordRepo.save(notebookWordEntities);

                } catch (error) {
                    console.log(error);
                }
            }

            return 'ok';
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === 'ENOENT') {
                throw new NotFoundException(`Không tìm thấy thư mục ${folderPath}`);
            }
            throw new InternalServerErrorException('Không thể tạo notebooks từ thư mục');
        }
    }

    async deleteNotebook(id: number) {
        try {
            const notebook = await this.notebookRepo.findOne({ where: { id } });
            if (!notebook) {
                throw new NotFoundException(`Notebook with ID ${id} not found`);
            }
            await this.notebookRepo.remove(notebook);
            return notebook;
        } catch (error) {
            throw error;
        }

    }

    async getNotebookWithWords(notebookId: number) {
        try {
            const notebook = await this.notebookRepo.findOne({
                where: { id: notebookId },
            });

            if (!notebook) {
                throw new NotFoundException(`Notebook with ID ${notebookId} not found`);
            }

            const words = await this.notebookWordRepo.find({
                where: { notebook_id: notebookId },
                order: { created_at: 'DESC' },
            });

            return {
                ...notebook,
                words,
            };
        } catch (error) {
            console.error('Error fetching notebook with words:', error);
            throw new InternalServerErrorException('Could not retrieve notebook and words');
        }
    }

    async updateWordInNotebook(
        user_id: number,
        wordId: number,
        updateWordDto: Partial<CreateNotebookWordDto>
    ): Promise<NotebookWord> {
        try {
            // Tìm từ vựng và include cả notebook để kiểm tra quyền
            const word = await this.notebookWordRepo.findOne({
                where: { id: wordId },
                relations: ['notebook']
            });

            if (!word) {
                throw new NotFoundException(`Không tìm thấy từ vựng với ID ${wordId}`);
            }

            // Kiểm tra notebook có thuộc về user không
            if (word.notebook.user_id !== user_id) {
                throw new NotFoundException(`Bạn không có quyền sửa từ này`);
            }

            // Cập nhật các field mới
            const updatedWord = this.notebookWordRepo.merge(word, updateWordDto);
            return await this.notebookWordRepo.save(updatedWord);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi cập nhật từ vựng');
        }
    }
}
