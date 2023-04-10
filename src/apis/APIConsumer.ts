import { getPlatformsOptions, getStatusOptions, insertGame, readItem, searchForNewGames, updateGameInfo } from '../apis/NotionApi';
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { IUpdateGameInfo } from "../interfaces/IUpdateGameInfo";
import { getGameInfo } from "../apis/IGDBApi";
import GameInfo from '../interfaces/GameInfo';

export class APIConsumer {
  constructor() { };

  private async getGameInfo(gameName: string): Promise<GameInfo> {
    const gamesInfo = await getGameInfo(gameName);

    return gamesInfo;
  }

  // private async insertNewGameProcess(gameName: string, requestOptions: ApicalypseConfig) {
  //   const gamesInfo = await this.getGameInfo(gameName, requestOptions);

  //   const gameInformationComplete = await this.getInfosByID(gamesInfo, requestOptions);

  //   const gamesInfoPromisees = gameInformationComplete.map(async gameInfo => {
  //     const platformNames = gameInfo.platform?.map(platform => platform.name);
  //     const releaseDate = gameInfo.releaseDate.toISOString();
  //     const timeToBeat = gameInfo.timeToBeat;

  //     return insertGame(gameInfo.name, { platformNames, releaseDate, timeToBeat });
  //   });

  //   const gamesAdd = await Promise.all(gamesInfoPromisees);

  //   const gamesAddResult = gamesAdd.filter(games => games !== undefined) as CreatePageResponse[];

  //   return gamesAddResult;
  // }

  // public async insertNewGame(title: string): Promise<CreatePageResponse[]> {
  //   const requestOptions = await this.getRequestOptions();

  //   const gamesInfo = await this.insertNewGameProcess(title, requestOptions)

  //   return gamesInfo;
  // }

  public async searchGame(title: string) {
    return await readItem(title);
  }

  public async updateNewGamesInfo(): Promise<void> {
    const newGamesPromise = searchForNewGames();
    const platformOptionsResponsePromise = getPlatformsOptions();
    const statusOptionsPromise = getStatusOptions();

    const [newGames, platformOptionsResponse, statusOptions] = await Promise.all([newGamesPromise, platformOptionsResponsePromise, statusOptionsPromise]);

    const updateGamesInfoPromises = newGames.map(async game => {

      const gameTitle = game.properties.game_title.title[0].text.content;

      const gameInfo = await this.getGameInfo(gameTitle);

      const availablePlatforms = platformOptionsResponse.platformOptions.filter(platform => gameInfo.platform?.find(platformGame => platformGame.name === platform.name));

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
