import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountType {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    name: string;
    
    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'enum', default: 'LOCAL', enum: AccountType })
    account_type: string;
  
    @Column({type: 'enum',  default: 'user', enum: UserRole })
    role: string;
  
    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}