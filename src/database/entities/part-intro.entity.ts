import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Part } from './part.entity';

@Entity('part_intros')
export class PartIntro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'json' })
  answers: string[];

  @Column({ type: 'int' })
  correct_answer: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  explains: string;

  @Column()
  part_id: number;

  @ManyToOne(() => Part, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: Part;
}
