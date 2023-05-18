import { inject, injectable } from 'tsyringe';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionApi } from '../../../apis/NotionApi';

import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';

import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';

interface Request {
  userId: string;
  pageId: string;
}

@injectable()
export class IndexPageNotionApiService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  async execute({ userId, pageId }: Request): Promise<GetPageResponse> {
    const notionUserConnection = await this.notionUserConnectionRepository.findByUserId(userId);

    if (!notionUserConnection) {
      throw new Error('Notion user connection not found');
    }

    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    const notionApi = new NotionApi(notionUserConnection.accessToken, userSettings.statusName);

    const page = await notionApi.getPageById(pageId);

    return page;
  }
}
