/* eslint-disable import/no-extraneous-dependencies */
import { inject, injectable } from 'tsyringe';
import polly from 'polly-js';
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

interface DatabaseByPage {
  [key: string]: any[];
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

  async execute(data: Request): Promise<NotionUserConnection | undefined> {
    if (!data.accessToken) {
      throw new Error('Access Token is required');
    }

    const userSettings = await this.userSettingsRepository.findByUserId(data.userId);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    const notionUserConnection = await polly().waitAndRetry([100, 400, 800, 1200, 8000]).executeForPromise(async () => {
      const notionApi = new NotionApi(data.accessToken, userSettings.statusName);

      const allDatabases = await notionApi.getAllDatabases();

      if (allDatabases.length === 0) {
        throw new AppError('No databases found');
      }

      const databasesByPage: DatabaseByPage = {};

      const pagesOfDatabasesPromise = allDatabases.map(async (database) => {
        const pageDatabase = await notionApi.getTopHierarchyPageIdByDatabaseId(database.id);

        if (!pageDatabase) {
          return undefined;
        }

        if (!databasesByPage[pageDatabase.page_id]) {
          databasesByPage[pageDatabase.page_id] = [database];
        } else {
          databasesByPage[pageDatabase.page_id] = [...databasesByPage[pageDatabase.page_id], database];
        }

        return { pageId: pageDatabase.page_id, database };
      });

      await Promise.all(pagesOfDatabasesPromise);

      const entries = Object.entries(databasesByPage);

      const notionTablePagesAndDatabases = entries.map((pageAndDatabase) => {
        if (!pageAndDatabase) {
          return undefined;
        }

        const [pageId, database] = pageAndDatabase;

        const gameDatabaseId = database.find((gameDatabase) => gameDatabase.title[0].plain_text === 'Games')?.id;
        const platformDatabaseId = database.find((platformDatabase) => platformDatabase.title[0].plain_text === 'Platforms')?.id;

        if (!gameDatabaseId || !platformDatabaseId) {
          return undefined;
        }

        return {
          userId: data.userId,
          pageId,
          gameDatabaseId,
          platformDatabaseId,
          ownerId: data.ownerId,
        } as ICreateNotionTablePagesAndDatabasesDTO;
      });

      const createNotionTablePagesAndDatabasesPromise = notionTablePagesAndDatabases.map(async (notionTablePageAndDatabase) => {
        if (!notionTablePageAndDatabase) {
          return undefined;
        }

        const notionTablePageAndDatabaseAlreadyExists = await this.notionTablePagesAndDatabasesRepository.findById(notionTablePageAndDatabase.pageId);

        if (notionTablePageAndDatabaseAlreadyExists) {
          await this.notionTablePagesAndDatabasesRepository.delete(notionTablePageAndDatabaseAlreadyExists.id);
        }

        const notionTablePageAndDatabaseCreated = await this.notionTablePagesAndDatabasesRepository.create(notionTablePageAndDatabase);

        if (!notionTablePageAndDatabaseCreated) {
          throw new AppError('Could not create NotionTablePagesAndDatabases');
        }

        return notionTablePageAndDatabaseCreated;
      });

      await Promise.all(createNotionTablePagesAndDatabasesPromise);

      const notionUserConnectionAlreadyExists = await this.notionUserConnectionRepository.findByUserId(data.userId);

      if (notionUserConnectionAlreadyExists) {
        await this.notionUserConnectionRepository.delete(notionUserConnectionAlreadyExists.id);
      }

      const notionUserConnectionCreated = await this.notionUserConnectionRepository.create(data);

      if (!notionUserConnectionCreated) {
        throw new Error('Could not create NotionUserConnection');
      }

      return notionUserConnectionCreated;
    }).then((result) => result);

    return notionUserConnection;
  }
}
