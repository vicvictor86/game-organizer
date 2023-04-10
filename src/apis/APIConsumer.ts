import apicalypse, { ApicalypseConfig } from "apicalypse";
import APIResponse from '../interfaces/APIResponse';
import GameInfo from '../interfaces/GameInfo';

import getToken from '../auth/getToken';
import { getPlatformsOptions, insertGame, readItem, searchForNewGames, updateGameInfo } from '../apis/NotionApi';
import { getGameTimeToBeat } from '../apis/HLTBApi';
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { IUpdateGameInfo } from "../interfaces/IUpdateGameInfo";

export class APIConsumer {
  constructor() { };

  private async getRequestOptions(): Promise<ApicalypseConfig> {
    const token = await getToken();
    const { access_token, expiresIn, tokenType } = token;

    const requestOptions: ApicalypseConfig = {
      baseURL: process.env.API_BASE_URL,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${access_token}`
      },
    };

    return requestOptions;
  }

  private async getGameInfo(gameName: string, requestOptions: ApicalypseConfig): Promise<APIResponse[]> {
    const response = apicalypse(requestOptions);
    const apiResponse = await response.fields([
      'name', 'total_rating', 'first_release_date', 'genres', 'language_supports', 'platforms',
    ]).search(gameName).limit(1).request(`${process.env.API_BASE_URL}/games`);

    return apiResponse.data;
  }

  private async getInfosByID(data: APIResponse[], requestOptions: ApicalypseConfig): Promise<GameInfo[]> {
    const response = apicalypse(requestOptions);

    const allPromises = data.map(async game => {
      const gameGenreFormatted = game.genres.toString();
      const promisesGenre = await response.fields('name').where(`id = (${gameGenreFormatted})`).request(`${process.env.API_BASE_URL}/genres`);

      const gamePlatformFormatted = game.platforms.toString();
      const promisesPlatform = await response.fields('name').where(`id = (${gamePlatformFormatted})`).request(`${process.env.API_BASE_URL}/platforms`);

      return { gameId: game.id, promisesGenre, promisesPlatform };
    });

    const gamesGenresAndPlatform = await Promise.all(allPromises);

    const gameInfoPromises = data.map(async game => {
      const unixTimeStampToMillis = new Date(game.first_release_date * 1000);
      const timesToBeat = await getGameTimeToBeat(game.name);

      const actualGameInfo = {
        name: game.name,
        platform: gamesGenresAndPlatform.find(gameResolve => gameResolve.gameId === game.id)?.promisesPlatform.data,
        genres: gamesGenresAndPlatform.find(gameResolve => gameResolve.gameId === game.id)?.promisesGenre.data,
        rating: game.total_rating,
        releaseDate: unixTimeStampToMillis,
        timeToBeat: {
          main: timesToBeat?.main || 0,
          MainExtra: timesToBeat?.MainExtra || 0,
          Completionist: timesToBeat?.Completionist || 0,
        },
      } as GameInfo;

      return actualGameInfo;
    });

    const gamesInfo = await Promise.all(gameInfoPromises);

    return gamesInfo;
  }

  private async insertNewGameProcess(gameName: string, requestOptions: ApicalypseConfig) {
    const gamesInfo = await this.getGameInfo(gameName, requestOptions);

    const gameInformationComplete = await this.getInfosByID(gamesInfo, requestOptions);

    const gamesInfoPromisees = gameInformationComplete.map(async gameInfo => {
      const platformNames = gameInfo.platform?.map(platform => platform.name);
      const releaseDate = gameInfo.releaseDate.toISOString();
      const timeToBeat = gameInfo.timeToBeat;

      return insertGame(gameInfo.name, { platformNames, releaseDate, timeToBeat });
    });

    const gamesAdd = await Promise.all(gamesInfoPromisees);

    const gamesAddResult = gamesAdd.filter(games => games !== undefined) as CreatePageResponse[];

    return gamesAddResult;
  }

  public async insertNewGame(title: string): Promise<CreatePageResponse[]> {
    const requestOptions = await this.getRequestOptions();

    const gamesInfo = await this.insertNewGameProcess(title, requestOptions)

    return gamesInfo;
  }

  public async searchGame(title: string) {
    return await readItem(title);
  }

  public async updateNewGamesInfo(): Promise<void> {
    const newGames = await searchForNewGames();
    const requestOptions = await this.getRequestOptions();

    const updateGamesInfoPromises = newGames.map(async game => {

      const gameTitle = game.properties.game_title.title[0].text.content;

      const gameInfo = await this.getGameInfo(gameTitle, requestOptions);
      const gameInformationComplete = await this.getInfosByID(gameInfo, requestOptions);

      const platformOptionsResponse = await getPlatformsOptions();
      const availablePlatforms = platformOptionsResponse.platformOptions.filter(platform => gameInformationComplete[0].platform?.find(platformGame => platformGame.name === platform.name));
      console.log(availablePlatforms)

      const updateInfo = {
        page_id: game.id,
        title: gameInformationComplete[0].name,
        timeToBeat: gameInformationComplete[0].timeToBeat,
        releaseDate: gameInformationComplete[0].releaseDate,
        platform: availablePlatforms,
        obtained_data: true,
      } as IUpdateGameInfo;

      updateGameInfo(updateInfo);
    });

    await Promise.all(updateGamesInfoPromises);
  }
}
