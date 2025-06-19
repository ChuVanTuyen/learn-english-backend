import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KindContent } from './kind-content.entity';

@Entity('examples')
export class Example {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    example: string;

    @Column({ type: 'text' })
    mean: string;

    @Column({ name: 'kind_content_id', nullable: false })
    kind_content_id: number;
    
    @ManyToOne(() => KindContent, kindContent => kindContent.examples, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'kind_content_id' })
    kindContent: KindContent;
}