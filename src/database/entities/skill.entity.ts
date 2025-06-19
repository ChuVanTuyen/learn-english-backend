import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Part } from './part.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'boolean' })
  is_listening: boolean;

  @OneToMany(() => Part, (part) => part.skill)
  parts: Part[];
}
