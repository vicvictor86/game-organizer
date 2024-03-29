import { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { AppError } from '../shared/errors/AppError';

import { NotionApi } from './NotionApi';
import { getGameInfo } from './IGDBApi';

import { IUpdateGameInfo } from '../interfaces/IUpdateGameInfo';
import { GameInfo } from '../interfaces/GameInfo';
import { GamesDatabase } from '../interfaces/GamesDatabase';
import { IAPIConsumer } from '../interfaces/IAPIConsumer';

export class APIConsumer implements IAPIConsumer {
  private gamesInDatabase: PageObjectResponse[] = [];

  private notion: NotionApi;

  constructor(accessToken: string, defaultStatusName: string, gameDatabaseId?: string, platformDatabaseId?: string) {
    this.notion = new NotionApi(accessToken, defaultStatusName, gameDatabaseId, platformDatabaseId);
  }

  public async searchDatabasesIds(databaseGameName: string, databasePlatformName: string) {
    await this.notion.searchDatabasesIds(databaseGameName, databasePlatformName);
  }

  public async getGamesInDatabase(): Promise<PageObjectResponse[]> {
    if (this.gamesInDatabase.length === 0) {
      this.gamesInDatabase = await this.notion.getAllGames();
    }

    return this.gamesInDatabase;
  }

  public async getDatabase(name: string): Promise<DatabaseObjectResponse> {
    const database = await this.notion.getDatabaseByName(name);

    return database;
  }

  private async getGameInfo(gameName: string): Promise<GameInfo | undefined> {
    const gamesInfo = await getGameInfo(gameName);

    return gamesInfo;
  }

  private async insertNewGameProcess(gameName: string) {
    const gameInfo = await this.getGameInfo(gameName);

    if (!gameInfo) {
      throw new AppError('Game not found', 400);
    }

    const platformNames = gameInfo.platforms?.map((platform) => platform.name);
    const releaseDate = gameInfo.releaseDate.toISOString();
    const { timeToBeat } = gameInfo;

    return this.notion.insertGame(gameInfo.name, { platformNames, releaseDate, timeToBeat });
  }

  public async insertNewGame(title: string): Promise<GameInfo | undefined> {
    const gamesInfo = await this.insertNewGameProcess(title);

    return gamesInfo;
  }

  public async searchGame(title: string) {
    return this.notion.readItem(title);
  }

  public async updateNewGamesInfo(): Promise<void> {
    const newGamesPromise = this.notion.searchForNewGames();
    const platformOptionsResponsePromise = this.notion.getPlatformsOptions();
    const statusOptionsPromise = this.notion.getStatusOptions();

    const [newGames, platformOptionsResponse, statusOptions] = await Promise.all([newGamesPromise, platformOptionsResponsePromise, statusOptionsPromise]);

    const updateGamesInfoPromises = newGames.map(async (game) => {
      const gameProperties = game.properties as GamesDatabase;
      const gameTitle = gameProperties.game_title.title[0].text.content;

      const gameInfo = await this.getGameInfo(gameTitle);

      if (!gameInfo) {
        this.notion.updateGameInfo({
          page_id: game.id,
          title: `The game ${gameTitle} was not found`,
          platform: [],
          releaseDate: new Date(),
          timeToBeat: { completionist: 0, main: 0, mainExtra: 0 },
          obtained_data: true,
        }, statusOptions, 'Not Found');

        return;
      }

      const gameAlreadyExists = this.gamesInDatabase.find((gameInDatabase) => {
        const gameInDatabaseProperties = gameInDatabase.properties as GamesDatabase;

        return gameInDatabaseProperties.game_title.title[0].text.content === gameInfo.name && gameInDatabaseProperties.obtained_data === true;
      });

      if (gameAlreadyExists) {
        this.notion.updateGameInfo({
          page_id: game.id,
          title: `The game ${gameInfo.name} already been added`,
          platform: [],
          releaseDate: new Date(),
          timeToBeat: { completionist: 0, main: 0, mainExtra: 0 },
          obtained_data: true,
        }, statusOptions, 'Already Added');

        return;
      }

      const availablePlatforms = platformOptionsResponse.platformOptions.filter((platform) => gameInfo.platforms?.find((platformGame) => platformGame.name === platform.name
          || (platformGame.name.includes('PC') && platform.name === 'Steam')));

      const updateInfo = {
        page_id: game.id,
        title: gameInfo.name,
        timeToBeat: gameInfo.timeToBeat,
        releaseDate: gameInfo.releaseDate,
        platform: availablePlatforms,
        obtained_data: true,
      } as IUpdateGameInfo;

      this.notion.updateGameInfo(updateInfo, statusOptions);
    });

    await Promise.all(updateGamesInfoPromises);
  }
}
