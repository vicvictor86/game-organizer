/* eslint-disable no-shadow */
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

interface Response {
  notionUserConnection: NotionUserConnection;
  pages: any[];
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

  async execute(data: Request): Promise<Response | undefined> {
    if (!data.accessToken) {
      throw new Error('Access Token is required');
    }

    const userSettings = await this.userSettingsRepository.findByUserId(data.userId);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    const { notionUserConnectionCreated, allPages } = await polly().waitAndRetry([4000, 6000]).executeForPromise(async () => {
      const notionUserConnectionAlreadyExists = await this.notionUserConnectionRepository.findByUserId(data.userId);

      if (notionUserConnectionAlreadyExists) {
        await this.notionUserConnectionRepository.delete(notionUserConnectionAlreadyExists.id);
      }

      const notionUserConnectionCreated = await this.notionUserConnectionRepository.create(data);

      if (!notionUserConnectionCreated || (notionUserConnectionCreated && !notionUserConnectionCreated.duplicatedTemplateId)) {
        throw new Error('Could not create NotionUserConnection');
      }

      const allPages = [{ id: notionUserConnectionCreated.duplicatedTemplateId }];

      return { notionUserConnectionCreated, allPages };
    }).then((result) => result);

    return { notionUserConnection: notionUserConnectionCreated, pages: allPages };
  }
}
