import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Exam } from 'src/database/entities/exam.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Part } from 'src/database/entities/part.entity';
import { ChildrenQues } from 'src/database/entities/child-question.entity';
// import { createWriteStream, existsSync, mkdirSync } from 'fs';
// import { join, dirname } from 'path';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Exam)
        private examRepo: Repository<Exam>,
        @InjectRepository(Skill)
        private skillRepo: Repository<Skill>,
        @InjectRepository(Part)
        private partRepo: Repository<Part>,
        @InjectRepository(Question)
        private questionRepo: Repository<Question>,
        @InjectRepository(ChildrenQues)
        private childrenRepo: Repository<ChildrenQues>
    ) { }

    async seedMultiQuestion() {
        for (let i = 1; i <= 12; i++) {
            await this.seedQuestions(i);
        }
        return 'ok';
    }

    async seedQuestions(id: number) {
        const filePath = path.resolve('src/modules/exam/seed/data/test' + id + '.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const exam = JSON.parse(rawData);

        const newExam = await this.examRepo.save({
            name: exam.name,
            type: exam.type,
            time: 120
        });

        let idPart = 1;
        let idSkill = 1;
        for (const skill of exam.skills) {
            if(id < 2) {
                const newSkill = await this.skillRepo.save({
                    name: skill.name,
                    type: skill.type,
                    time: skill.is_listening === 1 ? 45 : 75,
                    is_listening: skill.is_listening === 1
                });
            }
            
            for (const part of skill.parts) {
                if(id < 2) {
                    const newPart = await this.partRepo.save({
                        name: part.name,
                        title: part.title,
                        amount: part.amount,
                        skill_id: idSkill
                    });
                }
                

                let orderIdx = 0;
                for (const ques of part.questions) {
                    const newQuestion = await this.questionRepo.save({
                        audio: this.changeUrl(id, '/audio/', ques.audio),
                        text_audio: ques.text_audio,
                        text_audio_trans: ques.text_audio_trans ? JSON.parse(ques.text_audio_trans).vn : '',
                        image: this.changeUrl(id, '/image/', ques.image),
                        title: ques.title,
                        text_read: await this.processHtmlAndDownloadImages(ques.text_read, id),
                        text_read_trans: ques.text_read_trans ? JSON.parse(ques.text_read_trans).vn : '',
                        order_idx: orderIdx++,
                        part_id: idPart,
                        exam_id: newExam.id
                    });
                    let order_child = 0;
                    for (const child of ques.childrens) {
                        await this.childrenRepo.save({
                            title: child.title,
                            answers: JSON.parse(child.answers),
                            correct_answer: child.correct_answer,
                            image: this.changeUrl(id, '/image/', child.image),
                            explains: child.explains ? JSON.parse(child.explains).vn : '',
                            write_answer: child.write_answer,
                            question_id: newQuestion.id,
                            order_idx: order_child++
                        });
                    }
                }
                idPart++;
            }
            idSkill++;
        }

        console.log('✅ Seeding completed successfully.');
    }

    async processHtmlAndDownloadImages(html: string, id: number): Promise<string> {
        const imgSrcRegex = /<img[^>]+src="([^">]+)"/g;
        let match: RegExpExecArray | null;
        let updatedHtml = html;
        const baseUrl = 'https://migiitoeic.eupgroup.net/uploads/';

        while ((match = imgSrcRegex.exec(html)) !== null) {
            const imgUrl = match[1];
            // this.downloadAndSave(imgUrl, 'exam/test' + id + '/image');
            if (imgUrl.startsWith(baseUrl)) {
                const fileName = path.basename(imgUrl);
                updatedHtml = updatedHtml.replace(imgUrl, 'public/exam/test' + id + '/image/' + fileName);
            }
        }

        return updatedHtml;
    }

    changeUrl(id: number, folder: string, oldUrl?: string) {
        if(!oldUrl) return '';
        const arrAu = oldUrl.split('/');
        return 'public/exam/test' + id + folder + arrAu[arrAu.length - 1];
    }

    // async downloadAndSave(url: string, folder: string) {
    //     try {
    //         const fileName = path.basename(url);
    //         const filePath = path.join('public', folder, fileName);

    //         // Tạo folder nếu chưa tồn tại
    //         const dir = path.dirname(filePath);
    //         if (!fs.existsSync(dir)) {
    //             fs.mkdirSync(dir, { recursive: true });
    //             console.log(`📁 Created directory: ${dir}`);
    //         }

    //         // Kiểm tra nếu file đã tồn tại
    //         console.log(filePath);
    //         if (fs.existsSync(filePath)) {
    //             console.log(`✅ File already exists, skipping download: ${filePath}`);
    //             return filePath.replace(/\\/g, '/');
    //         }

    //         // Tải file và lưu
    //         const writer = fs.createWriteStream(filePath);
    //         const response = await axios({
    //             url,
    //             method: 'GET',
    //             responseType: 'stream',
    //         });

    //         // Đợi hoàn tất ghi file trước khi return
    //         await new Promise<void>((resolve, reject) => {
    //             response.data.pipe(writer);
    //             writer.on('finish', resolve);
    //             writer.on('error', reject);
    //         });

    //         console.log(`🎧 File MP3 downloaded and saved: ${filePath}`);
    //         return filePath.replace(/\\/g, '/');
    //     } catch (error) {
    //         console.error('❌ Error downloading MP3 file:', error.message);
    //         throw new Error('Không thể tải file MP3.');
    //     }
    // }

    async handleDataExam () {
        // const list = await this.questionRepo.find();
        // for (const ques of list) {
        //     if(ques.image) {
        //         const arr = ques.image.split('/');
        //         const name = arr[arr.length - 1];
        //         ques.image = 'public/exam/test1/image/' + name;
        //     }
        //     if(ques.audio) {
        //         const arr = ques.audio.split('/');
        //         const name = arr[arr.length - 1];
        //         ques.audio = 'public/exam/test1/image/' + name;
        //     }
        // }

        // const childs: any[] = await this.childrenRepo.find();
        // for (const child of childs) {
        //     child.answers = JSON.parse(child.answers)
        //     // if(child.image) {
        //     //     const arr = child.image.split('/');
        //     //     const name = arr[arr.length - 1];
        //     //     child.image = 'public/exam/test1/image/' + name;
        //     // }
        // }

        // // await this.questionRepo.save(list);
        // await this.childrenRepo.save(childs);

        return 'ok change';

    }
}