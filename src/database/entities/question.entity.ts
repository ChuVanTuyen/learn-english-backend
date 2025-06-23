import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Part } from './part.entity'; // Đường dẫn tùy theo cấu trúc project
import { ChildrenQues } from './child-question.entity';
import { Exam } from './exam.entity';

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'audio', type: 'varchar', length: 100, nullable: true })
    audio: string;

    @Column({ name: 'text_read', type: 'text', nullable: true })
    text_read: string;

    @Column({ name: 'text_read_trans', type: 'text', nullable: true })
    text_read_trans: string;

    @Column({ name: 'text_audio', type: 'text', nullable: true })
    text_audio: string;

    @Column({ name: 'text_audio_trans', type: 'json', nullable: true })
    text_audio_trans: string;

    @Column({ name: 'image', type: 'varchar', length: 100, nullable: true })
    image: string;

    @Column({ name: 'title', type: 'text', nullable: true })
    title: string;

    @Column({ name: 'order_idx', type: 'int' })
    order_idx: number;

    @OneToMany(() => ChildrenQues, (child) => child.question)
    child_ques: ChildrenQues[];

    @Column()
    exam_id: number;

    @ManyToOne(() => Exam, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'exam_id' })
    exam: Exam;

    @Column()
    part_id: number;

    @ManyToOne(() => Part, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'part_id' })
    part: Part;
}
