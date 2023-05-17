import { connectionSource } from '../../../../../shared/infra/typeorm';
import { ICreateNotionTablePagesAndDatabasesDTO } from '../../../dtos/ICreateNotionTablePagesAndDatabasesDTO';
import { INotionTablePagesAndDatabasesRepository } from '../../../repositories/INotionTablePagesAndDatabasesRepository';
import { NotionTablePagesAndDatabases } from '../entities/NotionTablePagesAndDatabases';

const notionTablePagesAndDatabases = connectionSource.getRepository(NotionTablePagesAndDatabases);

export const NotionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository = notionTablePagesAndDatabases.extend({
  async findById(id: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { id },
    });

    return notionTablePagesAndDatabasesData;
  },

  async findByUserId(userId: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { userId },
    });

    return notionTablePagesAndDatabasesData;
  },

  async findByOwnerId(ownerId: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { ownerId },
    });

    return notionTablePagesAndDatabasesData;
  },

  async findByPageId(pageId: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { pageId },
    });

    return notionTablePagesAndDatabasesData;
  },

  async findByGameDatabaseId(platformDatabaseId: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { platformDatabaseId },
    });

    return notionTablePagesAndDatabasesData;
  },

  async findByPlatformDatabaseId(platformDatabaseId: string): Promise<NotionTablePagesAndDatabases | null> {
    const notionTablePagesAndDatabasesData = await notionTablePagesAndDatabases.findOne({
      where: { platformDatabaseId },
    });

    return notionTablePagesAndDatabasesData;
  },

  async create(data: ICreateNotionTablePagesAndDatabasesDTO): Promise<NotionTablePagesAndDatabases> {
    const notionTablePagesAndDatabasesData = notionTablePagesAndDatabases.create(data);

    await notionTablePagesAndDatabases.save(notionTablePagesAndDatabasesData);

    return notionTablePagesAndDatabasesData;
  },

  async save(notionUserConnection: NotionTablePagesAndDatabases): Promise<NotionTablePagesAndDatabases> {
    return notionTablePagesAndDatabases.save(notionUserConnection);
  },
});
