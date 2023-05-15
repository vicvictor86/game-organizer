import { Exclude } from 'class-transformer';

import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({ name: 'user_id' })
    userId: string;

  @Exclude()
  @OneToOne(() => User, (user) => user, { eager: true })
  @JoinColumn({ name: 'user_id' })
    user: User;

  @Column({ name: 'status_name' })
    statusName: string;

  @Column({ name: 'last_database_selected_id' })
    lastDatabaseSelectedId: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
