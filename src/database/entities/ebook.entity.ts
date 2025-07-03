import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ebooks')
export class Ebook {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 100 })
    pdf: string;

    @Column({ length: 100 })
    thumbnail: string;

    @Column({ length: 100, nullable: true })
    author: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}