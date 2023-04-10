import { getPlatformsOptions, getStatusOptions, insertGame, readItem, searchForNewGames, updateGameInfo } from '../apis/NotionApi';
import { IUpdateGameInfo } from "../interfaces/IUpdateGameInfo";
import { getGameInfo } from "../apis/IGDBApi";
import GameInfo from '../interfaces/GameInfo';
import { GamesDatabase } from '../interfaces/GamesDatabase';
import { IAPIConsumer } from '../interfaces/IAPIConsumer';
import { CreatePageResponse } from '@notionhq/client/build/src/api-endpoints';

export class APIConsumer implements IAPIConsumer {
  constructor() { };

  private async getGameInfo(gameName: string): Promise<GameInfo> {
    const gamesInfo = await getGameInfo(gameName);

    return gamesInfo;
  }

  private async insertNewGameProcess(gameName: string) {
    const gameInfo = await this.getGameInfo(gameName);

    const platformNames = gameInfo.platform?.map(platform => platform.name);
    const releaseDate = gameInfo.releaseDate.toISOString();
    const timeToBeat = gameInfo.timeToBeat;

    return await insertGame(gameInfo.name, { platformNames, releaseDate, timeToBeat });
  }

  public async insertNewGame(title: string): Promise<CreatePageResponse | undefined> {
    const gamesInfo = await this.insertNewGameProcess(title)

    return gamesInfo;
  }

  public async searchGame(title: string) {
    return await readItem(title);
  }

  public async updateNewGamesInfo(): Promise<void> {
    const newGamesPromise = searchForNewGames();
    const platformOptionsResponsePromise = getPlatformsOptions();
    const statusOptionsPromise = getStatusOptions();

    const [newGames, platformOptionsResponse, statusOptions] = await Promise.all([newGamesPromise, platformOptionsResponsePromise, statusOptionsPromise]);

    const updateGamesInfoPromises = newGames.map(async game => {

      const gameProperties = game.properties as GamesDatabase;
      const gameTitle = gameProperties.game_title.title[0].text.content;

      const gameInfo = await this.getGameInfo(gameTitle);

      const availablePlatforms = platformOptionsResponse.platformOptions.filter(platform => {
        return gameInfo.platform?.find(platformGame => platformGame.name === platform.name
          || (platformGame.name.includes('PC') && platform.name === 'Steam'))
      });

      const updateInfo = {
        page_id: game.id,
        title: gameInfo.name,
        timeToBeat: gameInfo.timeToBeat,
        releaseDate: gameInfo.releaseDate,
        platform: availablePlatforms,
        obtained_data: true,
      } as IUpdateGameInfo;

      updateGameInfo(updateInfo, statusOptions);
    });

    await Promise.all(updateGamesInfoPromises);
  }
}
