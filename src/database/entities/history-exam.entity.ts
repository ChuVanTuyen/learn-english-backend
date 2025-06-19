import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exam } from './exam.entity';

@Entity('history_exams')
export class HistoryExam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  content: { [key: string | number]: number }

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'int' })
  correct_listent: number;

  @Column({ type: 'int' })
  correct_read: number;

  @Column()
  exam_id: number;
  
  @ManyToOne(() => Exam, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column()
  user_id: number;
  
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
