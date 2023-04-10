import apicalypse, { ApicalypseConfig } from "apicalypse";
import APIResponse from '../interfaces/APIResponse';
import GameInfo from '../interfaces/GameInfo';

import getToken from '../auth/getToken';
import { getPlatformsOptions, getStatusOptions, insertGame, readItem, searchForNewGames, updateGameInfo } from '../apis/NotionApi';
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

  private async getGameInfo(gameName: string, requestOptions: ApicalypseConfig): Promise<APIResponse> {
    const response = apicalypse(requestOptions);
    const apiResponse = await response.fields([
      'name', 'total_rating', 'first_release_date', 'genres', 'language_supports', 'platforms',
    ]).search(gameName).limit(1).request(`${process.env.API_BASE_URL}/games`);

    return apiResponse.data[0];
  }

  private async getInfosByID(data: APIResponse, requestOptions: ApicalypseConfig): Promise<GameInfo> {
    const response = apicalypse(requestOptions);

    const gameGenreFormatted = data.genres.toString();
    const genresPromise = response.fields('name').where(`id = (${gameGenreFormatted})`).request(`${process.env.API_BASE_URL}/genres`);

    const gamePlatformFormatted = data.platforms.toString();
    const platformsPromise = response.fields('name').where(`id = (${gamePlatformFormatted})`).request(`${process.env.API_BASE_URL}/platforms`);

    const unixTimeStampToMillis = new Date(data.first_release_date * 1000);
    const timesToBeatPromise = getGameTimeToBeat(data.name);

    const [genres, platforms, timesToBeat] = await Promise.all([genresPromise, platformsPromise, timesToBeatPromise]);

    const actualGameInfo = {
      name: data.name,
      platform: platforms.data,
      genres: genres.data,
      rating: data.total_rating,
      releaseDate: unixTimeStampToMillis,
      timeToBeat: {
        main: timesToBeat?.main || 0,
        MainExtra: timesToBeat?.MainExtra || 0,
        Completionist: timesToBeat?.Completionist || 0,
      },
    } as GameInfo;

    return actualGameInfo;
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
    const newGamesPromise = searchForNewGames();
    const requestOptionsPromise = this.getRequestOptions();
    const platformOptionsResponsePromise = getPlatformsOptions();
    const statusOptionsPromise = getStatusOptions();

    const [newGames, requestOptions, platformOptionsResponse, statusOptions] = await Promise.all([newGamesPromise, requestOptionsPromise, platformOptionsResponsePromise, statusOptionsPromise]);

    const updateGamesInfoPromises = newGames.map(async game => {

      const gameTitle = game.properties.game_title.title[0].text.content;

      const gameInfo = await this.getGameInfo(gameTitle, requestOptions);
      const gameInformationComplete = await this.getInfosByID(gameInfo, requestOptions);

      const availablePlatforms = platformOptionsResponse.platformOptions.filter(platform => gameInformationComplete.platform?.find(platformGame => platformGame.name === platform.name));

      const updateInfo = {
        page_id: game.id,
        title: gameInformationComplete.name,
        timeToBeat: gameInformationComplete.timeToBeat,
        releaseDate: gameInformationComplete.releaseDate,
        platform: availablePlatforms,
        obtained_data: true,
      } as IUpdateGameInfo;

      updateGameInfo(updateInfo, statusOptions);
    });

    await Promise.all(updateGamesInfoPromises);
  }
}
