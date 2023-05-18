import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';
import { AppError } from '../../../shared/errors/AppError';

import { ICreateLoginSessionsDTO } from '../dtos/ICreateLoginSessionsDTO';

import { User } from '../infra/typeorm/entities/User';
import { UserSettings } from '../infra/typeorm/entities/UserSettings';

import { IUsersRepository } from '../repositories/IUsersRepository';
import { IUserSettingsRepository } from '../repositories/IUserSettingsRepository';

import { authConfig } from '../../../config/auth';
import { INotionTablePagesAndDatabasesRepository } from '../../integration/repositories/INotionTablePagesAndDatabasesRepository';
import { NotionApi } from '../../../apis/NotionApi';
import { INotionUserConnectionRepository } from '../../integration/repositories/INotionUserConnectionRepository';

interface PagesInfoToFront {
  id: string;
  title: string;
}

interface Response {
  user: User;

  token: string;

  userSettings: UserSettings;

  userPages: PagesInfoToFront[];
}

type PageResponseWithProperties = GetPageResponse & { properties: any };

@injectable()
export default class AuthenticateService {
  constructor(
    @inject('UsersRepository')
    private userRepository: IUsersRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,

    @inject('NotionTablePagesAndDatabasesRepository')
    private notionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository,

    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,
  ) { }

  public async execute({ username, password }: ICreateLoginSessionsDTO): Promise<Response> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new AppError('Username or password incorrect');
    }

    const hashedPassword = user.password;

    const authenticated = await compare(password, hashedPassword);

    if (!authenticated) {
      throw new AppError('Username or password incorrect');
    }

    const token = sign({}, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    const userSettings = await this.userSettingsRepository.findByUserId(user.id);

    if (!userSettings) {
      throw new AppError('User settings not found', 404);
    }

    const notionUserConnection = await this.notionUserConnectionRepository.findByUserId(user.id);

    if (!notionUserConnection) {
      throw new AppError('User connection not found', 404);
    }

    const tableAndPages = await this.notionTablePagesAndDatabasesRepository.findByUserId(user.id);

    if (!tableAndPages) {
      throw new AppError('Pages not found', 404);
    }

    const notionApi = new NotionApi(notionUserConnection.accessToken, userSettings.statusName);

    const pagesResponse = await notionApi.getPagesByIds(tableAndPages.map((tableAndPage) => tableAndPage.pageId)) as PageResponseWithProperties[];

    const userPages = pagesResponse.map((page) => ({
      id: page.id,
      title: page.properties.title.title[0].plain_text,
    } as PagesInfoToFront));

    return {
      user, token, userSettings, userPages,
    };
  }
}
