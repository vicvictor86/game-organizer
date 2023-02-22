import 'dotenv/config';
import apicalypse, { ApicalypseConfig } from "apicalypse";
import APIResponse from './interfaces/APIResponse';
import GameInfo from './interfaces/GameInfo';

import getToken from './auth/getToken';
import { insertGame } from './apis/NotionApi';
import { getGameTimeToBeat } from './apis/HLTBApi';

async function getGameInfo(gameName: string, requestOptions: ApicalypseConfig): Promise<APIResponse[]> {
  const response = apicalypse(requestOptions);
  const apiResponse = await response.fields([
    'name', 'total_rating', 'first_release_date', 'genres', 'language_supports', 'platforms',
  ]).search(gameName).limit(3).request(`${process.env.API_BASE_URL}/games`);

  return apiResponse.data;
}

async function getInfosByID(data: APIResponse[], requestOptions: ApicalypseConfig): Promise<GameInfo[]> {
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

async function insertNewGameInTable(gameName: string, requestOptions: ApicalypseConfig) {
  const gamesInfo = await getGameInfo(gameName, requestOptions);

  const gameInformationComplete = await getInfosByID(gamesInfo, requestOptions);

  gameInformationComplete.forEach(async gameInfo => {
    const platformNames = gameInfo.platform?.map(platform => platform.name);
    const releaseDate = gameInfo.releaseDate.toISOString();
    const timeToBeat = gameInfo.timeToBeat;
    await insertGame(gameInfo.name, { platformNames, releaseDate, timeToBeat });
  });
}
getToken().then(async responseToken => {
  const { access_token, expiresIn, tokenType } = responseToken;

  const requestOptions: ApicalypseConfig = {
    baseURL: process.env.API_BASE_URL,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${access_token}`
    },
  };

  // await readItem();
  await insertNewGameInTable('zelda', requestOptions)
});