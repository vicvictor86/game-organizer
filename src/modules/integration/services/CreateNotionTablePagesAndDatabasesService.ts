/* eslint-disable no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
import { inject, injectable } from 'tsyringe';
import polly from 'polly-js';
import { NotionApi } from '../../../apis/NotionApi';

import { ICreateNotionTablePagesAndDatabasesDTO } from '../dtos/ICreateNotionTablePagesAndDatabasesDTO';

import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';
import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';
import { INotionTablePagesAndDatabasesRepository } from '../repositories/INotionTablePagesAndDatabasesRepository';

import { AppError } from '../../../shared/errors/AppError';
import { NotionTablePagesAndDatabases } from '../infra/typeorm/entities/NotionTablePagesAndDatabases';

interface Request {
  userId: string;
}

interface DatabaseByPage {
  [key: string]: any[];
}

@injectable()
export class CreateNotionTablePagesAndDatabasesService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,

    @inject('NotionTablePagesAndDatabasesRepository')
    private notionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository,
  ) { }

  async execute({ userId }: Request): Promise<(NotionTablePagesAndDatabases | undefined)[]> {
    const notionUserConnection = await this.notionUserConnectionRepository.findByUserId(userId);

    if (!notionUserConnection) {
      throw new Error('Notion user connection not found');
    }

    if (!notionUserConnection.accessToken) {
      throw new Error('Access Token is required');
    }

    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    const notionTablePagesAndDatabasesCreated = await polly().waitAndRetry([4000, 6000]).executeForPromise(async () => {
      const notionApi = new NotionApi(notionUserConnection.accessToken, userSettings.statusName);

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
          userId,
          pageId,
          gameDatabaseId,
          platformDatabaseId,
          ownerId: notionUserConnection.ownerId,
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

      const createNotionTablePagesAndDatabases = await Promise.all(createNotionTablePagesAndDatabasesPromise);

      return createNotionTablePagesAndDatabases;
    });

    return notionTablePagesAndDatabasesCreated;
  }
}
