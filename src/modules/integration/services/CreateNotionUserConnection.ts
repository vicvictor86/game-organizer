import { inject, injectable } from 'tsyringe';
import { NotionApi } from '../../../apis/NotionApi';

import { ICreateNotionUserConnectionDTO } from '../dtos/ICreateNotionUserConnectionDTO';
import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';

import { NotionUserConnection } from '../infra/typeorm/entities/NotionUserConnection';
import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';

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
export class CreateNotionUserConnection {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,
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
    const { gameDatabaseId, platformDatabaseId } = await notionApi.searchDatabasesIds('Games Database', 'Platforms Database');

    const dataWithDatabases = {
      ...data, gameDatabaseId, platformDatabaseId,
    } as ICreateNotionUserConnectionDTO;

    const notionUserConnection = await this.notionUserConnectionRepository.create(dataWithDatabases);

    if (!notionUserConnection) {
      throw new Error('Could not create NotionUserConnection');
    }

    return notionUserConnection;
  }
}
