import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ContentWord } from './content-word.entity';

@Entity('idioms')
export class Idiom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    idiom: string;

    @Column({ type: 'text' })
    mean: string;

    @Column({ name: 'content_word_id', nullable: false })
    content_word_id: number;
        
    @ManyToOne(() => ContentWord, contentWord => contentWord.idioms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'content_word_id' })
    contentWord: ContentWord;
}