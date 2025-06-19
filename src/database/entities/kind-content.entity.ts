import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ContentWord } from './content-word.entity';
import { Example } from './example.entity';
@Entity('kind_contents')
export class KindContent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    means: string;

    @Column({ name: 'content_word_id', nullable: false })
    content_word_id: number;
        
    @ManyToOne(() => ContentWord, contentWord => contentWord.kindContents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'content_word_id' })
    contentWord: ContentWord;

    @OneToMany(() => Example, example => example.kindContent)
    examples: Example[];
}