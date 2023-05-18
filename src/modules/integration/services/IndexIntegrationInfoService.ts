import { inject, injectable } from 'tsyringe';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionApi } from '../../../apis/NotionApi';

import { INotionUserConnectionRepository } from '../repositories/INotionUserConnectionRepository';

import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';
import { INotionTablePagesAndDatabasesRepository } from '../repositories/INotionTablePagesAndDatabasesRepository';
import { IUsersRepository } from '../../users/repositories/IUsersRepository';
import { AppError } from '../../../shared/errors/AppError';
import { PagesInfoToFront } from '../../users/services/AuthenticateService';
import { User } from '../../users/infra/typeorm/entities/User';

interface Request {
  userId: string;
}

interface Response {
  user: User;
  userPages: PagesInfoToFront[];
}

type PageResponseWithProperties = GetPageResponse & { properties: any };

@injectable()
export class IndexIntegrationInfoService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,

    @inject('NotionTablePagesAndDatabasesRepository')
    private notionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository,
  ) { }

  async execute({ userId }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found');
    }

    const tableAndPagesPromise = this.notionTablePagesAndDatabasesRepository.findByUserId(user.id);
    const notionUserConnectionPromise = this.notionUserConnectionRepository.findByUserId(user.id);
    const userSettingsPromise = this.userSettingsRepository.findByUserId(user.id);

    const [tableAndPages, notionUserConnection, userSettings] = await Promise.all([tableAndPagesPromise, notionUserConnectionPromise, userSettingsPromise]);

    if (!tableAndPages) {
      throw new AppError('Pages not found', 404);
    }

    if (!notionUserConnection) {
      throw new AppError('Notion user connection not found', 404);
    }

    if (!userSettings) {
      throw new AppError('User settings not found', 404);
    }

    const notionApi = new NotionApi(notionUserConnection.accessToken, userSettings.statusName);

    const pagesResponse = await notionApi.getPagesByIds(tableAndPages.map((tableAndPage) => tableAndPage.pageId)) as PageResponseWithProperties[];

    const userPages = pagesResponse.map((page) => ({
      id: page.id,
      title: page.properties.title.title[0].plain_text,
    } as PagesInfoToFront));

    return { user, userPages };
  }
}
