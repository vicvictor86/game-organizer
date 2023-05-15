import { Exclude } from 'class-transformer';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../users/infra/typeorm/entities/User';

@Entity('notion_user_connection')
export class NotionUserConnection {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Exclude()
  @Column({ name: 'access_token' })
    accessToken: string;

  @Column({ name: 'bot_id' })
    botId: string;

  @Column({ name: 'duplicate_template_id' })
    duplicatedTemplateId: string;

  @Column({ name: 'owner_id' })
    ownerId: string;

  @Column({ name: 'user_id' })
    userId: string;

  @ManyToOne(() => User, (user) => user.notionUserConnections)
  @JoinColumn({ name: 'user_id' })
    user: User;

  @Column({ name: 'workspace_icon' })
    workspaceIcon: string;

  @Column({ name: 'workspace_id' })
    workspaceId: string;

  @Column({ name: 'workspace_name' })
    workspaceName: string;

  @Column({ name: 'game_database_id' })
    gameDatabaseId: string;

  @Column({ name: 'platform_database_id' })
    platformDatabaseId: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
