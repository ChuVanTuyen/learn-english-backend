import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('children_ques')
export class ChildrenQues {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question_id: number;

  @ManyToOne(() => Question, (question) => question.child_ques, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

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

  @Column({ type: 'varchar', length: 50, nullable: true })
  write_answer: string;

  @Column({ type: 'int' })
  order_idx: number;
}
