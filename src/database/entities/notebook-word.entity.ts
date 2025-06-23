import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Notebook } from './notebook.entity';

@Entity('notebook_words')
export class NotebookWord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'notebook_id' })
    notebook_id: number;

    @ManyToOne(() => Notebook, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notebook_id' })
    notebook: Notebook;

    @Column({ type: 'varchar', length: 255 })
    word: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    pronounce: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    kind: string;

    @Column({ type: 'text', nullable: true })
    mean: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}