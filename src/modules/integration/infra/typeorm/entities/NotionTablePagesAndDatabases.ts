import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../users/infra/typeorm/entities/User';

@Entity('notion_table_pages_and_databases')
export class NotionTablePagesAndDatabases {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({ name: 'user_id' })
    userId: string;

  @ManyToOne(() => User, (user) => user.notionUserConnections)
  @JoinColumn({ name: 'user_id' })
    user: User;

  @Column({ name: 'owner_id' })
    ownerId: string;

  @Column({ name: 'page_id' })
    pageId: string;

  @Column({ name: 'game_database_id' })
    gameDatabaseId: string;

  @Column({ name: 'platform_database_id' })
    platformDatabaseId: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
