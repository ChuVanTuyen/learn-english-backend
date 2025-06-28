import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { ObjectKey } from 'src/interfaces/common';

@Entity('sumary_practices')
export class SummaryPractice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json'})
  done_questions: ObjectKey<number[]>;

  @Column({ type: 'json'})
  false_questions: ObjectKey<number[]>;

  @Column()
  user_id: number;
  
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
