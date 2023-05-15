import { inject, injectable } from 'tsyringe';

import { AppError } from '../../../shared/errors/AppError';

import { APIConsumer } from '../../../apis/APIConsumer';

import { INotionUserConnectionRepository } from '../../integration/repositories/INotionUserConnectionRepository';
import { IUserSettingsRepository } from '../../users/repositories/IUserSettingsRepository';

import { GameInfo } from '../../../interfaces/GameInfo';

@injectable()
export default class CreateGameService {
  constructor(
    @inject('NotionUserConnectionRepository')
    private notionUserConnectionRepository: INotionUserConnectionRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  public async execute(title: string, userId: string): Promise<GameInfo | undefined> {
    const userConnection = await this.notionUserConnectionRepository.findByUserId(userId);

    if (!userConnection) {
      throw new AppError('User not found', 400);
    }

    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new AppError('User settings not found', 400);
    }

    const { accessToken } = userConnection;

    const { gameDatabaseId, platformDatabaseId } = userConnection;

    const apiConsumer = new APIConsumer(accessToken, userSettings.statusName, gameDatabaseId, platformDatabaseId);

    const gameInfo = await apiConsumer.insertNewGame(title);

    if (!gameInfo) {
      throw new AppError('Could not insert new game', 400);
    }

    return gameInfo;
  }
}
