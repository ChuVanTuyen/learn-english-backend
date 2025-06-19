import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Synonym } from './synonym.entity';
import { Antonym } from './antonym.entity';
import { Idiom } from './idiom.entity';
import { ContentWord } from './content-word.entity';

@Entity('words')
export class Word {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    word: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    pronounce: string;

    @OneToMany(() => Synonym, synonym => synonym.word)
    synonyms: Synonym[];

    @OneToMany(() => Antonym, antonym => antonym.word)
    antonyms: Antonym[];

    @OneToMany(() => ContentWord, content => content.word)
    contents: ContentWord[];

}