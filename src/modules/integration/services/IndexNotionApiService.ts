import { inject, injectable } from 'tsyringe';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionApi } from '../../../apis/NotionApi';

import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';

import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';

interface Request {
  userId: string;
}

type NotionResponse = GetPageResponse & {parent: {page_id: string}};

@injectable()
export class IndexUserAvailablePagesNotionApiService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  async execute({ userId }: Request): Promise<any[]> {
    const userSettingsPromise = this.userSettingsRepository.findByUserId(userId);
    const notionUserConnectionPromise = this.notionUserConnectionRepository.findByUserId(userId);

    const [userSettings, notionUserConnection] = await Promise.all([userSettingsPromise, notionUserConnectionPromise]);

    if (!userSettings) {
      throw new Error('User settings not found');
    }

    if (!notionUserConnection) {
      throw new Error('Notion user connection not found');
    }

    const { accessToken } = notionUserConnection;

    const notionApi = new NotionApi(accessToken, userSettings.statusName);
    const databases = await notionApi.getAllDatabases();

    const pagesIds = databases.map((database) => database.parent.page_id);
    const pages = await notionApi.getPagesByIds(pagesIds);
    const uniquePages = pages.filter((page, index, self) => self.findIndex((p) => p.id === page.id) === index) as NotionResponse[];

    const databaseParentPagesIds = uniquePages.map((page) => page.parent.page_id);
    const topHierarchyPages = await notionApi.getPagesByIds(databaseParentPagesIds);

    return topHierarchyPages;
  }
}
