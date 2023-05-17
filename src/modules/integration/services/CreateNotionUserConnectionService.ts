import { inject, injectable } from 'tsyringe';
import { NotionApi } from '../../../apis/NotionApi';

import { ICreateNotionTablePagesAndDatabasesDTO } from '../dtos/ICreateNotionTablePagesAndDatabasesDTO';

import { NotionUserConnection } from '../infra/typeorm/entities/NotionUserConnection';

import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';
import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';
import { INotionTablePagesAndDatabasesRepository } from '../repositories/INotionTablePagesAndDatabasesRepository';

import { AppError } from '../../../shared/errors/AppError';

interface Request {
  userId: string;
  botId: string;
  ownerId: string;
  accessToken: string;
  workspaceId: string;
  workspaceIcon?: string;
  workspaceName?: string;
  duplicatedTemplateId?: string;
}

@injectable()
export class CreateNotionUserConnectionService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,

    @inject('NotionTablePagesAndDatabasesRepository')
    private notionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository,
  ) { }

  async execute(data: Request): Promise<NotionUserConnection> {
    if (!data.accessToken) {
      throw new Error('Access Token is required');
    }

    const userSettings = await this.userSettingsRepository.findByUserId(data.userId);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    const notionApi = new NotionApi(data.accessToken, userSettings.statusName);

    const pages = await notionApi.getAllPages();

    const databasesPromise = pages.map(async (page) => {
      const databasePage = await notionApi.getDatabaseByTopHierarchyPageId(page.id);

      const gameDatabaseId = databasePage.find((database) => database.title[0].plain_text === 'Games')?.id;
      const platformDatabaseId = databasePage.find((database) => database.title[0].plain_text === 'Platforms')?.id;

      if (!gameDatabaseId || !platformDatabaseId) {
        throw new AppError('Could not find databases', 400);
      }

      return { gameDatabaseId, platformDatabaseId, pageId: page.id };
    });

    const databases = await Promise.all(databasesPromise);

    const notionTablePagesAndDatabases = databases.map((database) => ({
      userId: data.userId,
      pageId: database.pageId,
      gameDatabaseId: database.gameDatabaseId,
      platformDatabaseId: database.platformDatabaseId,
    }) as ICreateNotionTablePagesAndDatabasesDTO);

    const notionUserConnection = await this.notionUserConnectionRepository.create(data);

    if (!notionUserConnection) {
      throw new Error('Could not create NotionUserConnection');
    }

    const createNotionTablePagesAndDatabasesPromise = notionTablePagesAndDatabases.map(async (notionTablePageAndDatabase) => {
      const notionTablePageAndDatabaseCreated = await this.notionTablePagesAndDatabasesRepository.create(notionTablePageAndDatabase);

      if (!notionTablePageAndDatabaseCreated) {
        throw new AppError('Could not create NotionTablePagesAndDatabases');
      }

      return notionTablePageAndDatabaseCreated;
    });

    await Promise.all(createNotionTablePagesAndDatabasesPromise);

    return notionUserConnection;
  }
}
