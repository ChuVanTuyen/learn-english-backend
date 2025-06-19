import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Word } from './word.entity';

@Entity('antonyms')
export class Antonym {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    antonym: string;

    @Column({ name: 'word_id', nullable: false })
        word_id: number;
    
    @ManyToOne(() => Word, word => word.synonyms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'word_id' })
    word: Word;
}