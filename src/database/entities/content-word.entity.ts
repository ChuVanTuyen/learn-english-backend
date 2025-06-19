import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Word } from './word.entity';
import { KindContent } from './kind-content.entity';
import { Idiom } from './idiom.entity';

@Entity('content_words')
export class ContentWord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    kind: string;

    @Column({ name: 'word_id', nullable: false })
    word_id: number;
    
    @ManyToOne(() => Word, word => word.synonyms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'word_id' })
    word: Word;

    @Column({ name: 'kind_content_id', nullable: false })
    kind_content_id: number;
    
    @OneToMany(() => KindContent, kindContent => kindContent.contentWord, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'kind_content_id' })
    kindContents: KindContent[];

    @OneToMany(() => Idiom, idiom => idiom.contentWord)
    idioms: Idiom[];
}