import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Skill } from "./skill.entity";

@Entity('parts')
export class Part {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    skill_id: number;

    @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'skill_id' })
    skill: Skill;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'int' })
    amount: number;
}