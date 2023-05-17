import { inject, injectable } from 'tsyringe';

import { AppError } from '../../../shared/errors/AppError';

import { APIConsumer } from '../../../apis/APIConsumer';

import { INotionUserConnectionRepository } from '../../integration/repositories/INotionUserConnectionRepository';
import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';

import { GameInfo } from '../../../interfaces/GameInfo';
import { INotionTablePagesAndDatabasesRepository } from '../../integration/repositories/INotionTablePagesAndDatabasesRepository';

interface Request {
  title: string;
  userId: string;
  pageId: string;
}

@injectable()
export default class CreateGameService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,

    @inject('NotionTablePagesAndDatabasesRepository')
    private notionTablePagesAndDatabasesRepository: INotionTablePagesAndDatabasesRepository,
  ) { }

  public async execute({ title, userId, pageId }: Request): Promise<GameInfo | undefined> {
    const userConnection = await this.notionUserConnectionRepository.findByUserId(userId);

    if (!userConnection) {
      throw new AppError('User not found', 400);
    }

    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new AppError('User settings not found', 400);
    }

    const notionTablePageAndDatabase = await this.notionTablePagesAndDatabasesRepository.findByPageId(pageId);

    if (!notionTablePageAndDatabase) {
      throw new AppError('Page not found', 400);
    }

    if (notionTablePageAndDatabase.ownerId !== userConnection.ownerId) {
      throw new AppError('User not authorized', 401);
    }

    const { gameDatabaseId, platformDatabaseId } = notionTablePageAndDatabase;

    const { accessToken } = userConnection;

    const apiConsumer = new APIConsumer(accessToken, userSettings.statusName, gameDatabaseId, platformDatabaseId);

    const gameInfo = await apiConsumer.insertNewGame(title);

    if (!gameInfo) {
      throw new AppError('Could not insert new game', 400);
    }

    return gameInfo;
  }
}
