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
import { Part } from './part.entity';

@Entity('history_practices')
export class HistoryPractice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  content: { [key: string | number]: number }

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'int' })
  correct: number;

  @Column({ type: 'int' })
  total: number;

  @Column()
  part_id: number;
  
  @ManyToOne(() => Part, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'part_id' })
  part: Part;

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
