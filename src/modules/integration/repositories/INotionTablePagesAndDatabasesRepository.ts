import { ICreateNotionTablePagesAndDatabasesDTO } from '../dtos/ICreateNotionTablePagesAndDatabasesDTO';
import { NotionTablePagesAndDatabases } from '../infra/typeorm/entities/NotionTablePagesAndDatabases';

export interface INotionTablePagesAndDatabasesRepository {
  findById(id: string): Promise<NotionTablePagesAndDatabases | null>;
  findByUserId(userId: string): Promise<NotionTablePagesAndDatabases[] | null>;
  findByOwnerId(ownerId: string): Promise<NotionTablePagesAndDatabases | null>;
  findByPageId(pageId: string): Promise<NotionTablePagesAndDatabases | null>;
  findByGameDatabaseId(gameDatabaseId: string): Promise<NotionTablePagesAndDatabases | null>;
  findByPlatformDatabaseId(platformDatabaseId: string): Promise<NotionTablePagesAndDatabases | null>;
  create(data: ICreateNotionTablePagesAndDatabasesDTO): Promise<NotionTablePagesAndDatabases>;
  save(notionTablePagesAndDatabases: NotionTablePagesAndDatabases): Promise<NotionTablePagesAndDatabases>;
}
