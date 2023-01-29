import 'dotenv/config';
import apicalypse, { ApicalypseConfig } from "apicalypse";
import { HowLongToBeatService, HowLongToBeatEntry } from 'howlongtobeat';

import APIResponse from './interfaces/APIResponse';
import GameInfo from './interfaces/GameInfo';
import getToken from './auth/getToken';

const baseUrl = 'https://api.igdb.com/v4';
const hltbService = new HowLongToBeatService();

async function getGameInfo(gameName: string, requestOptions: ApicalypseConfig): Promise<APIResponse[]> {
  const response = apicalypse(requestOptions);
  const apiResponse = await response.fields([
    'name', 'total_rating', 'artworks', 'collection', 'first_release_date',
    'genres', 'involved_companies', 'language_supports', 'platforms',
  ]).search(gameName).limit(3).request(`${baseUrl}/games`);

  return apiResponse.data;
}

async function getIdInfo(data: APIResponse[], requestOptions: ApicalypseConfig): Promise<Promise<GameInfo>[]> {
  const response = apicalypse(requestOptions);

  const allPromises = data.map(async game => {
    const gameGenreFormatted = game.genres.toString();
    const promisesGenre = await response.fields('name').where(`id = (${gameGenreFormatted})`).request(`${baseUrl}/genres`);

    const gamePlatformFormatted = game.platforms.toString();
    const promisesPlatform = await response.fields('name').where(`id = (${gamePlatformFormatted})`).request(`${baseUrl}/platforms`);
    
    return { gameId: game.id, promisesGenre, promisesPlatform };
  });

  const allPromisesResolved = await Promise.all(allPromises);

  const gameInfo = data.map(async game => {
    const unixTimeStampToMillis = new Date(game.first_release_date * 1000);
    const hltbResponse = await hltbService.search(game.name);
    const firstGameHltb = hltbResponse.at(0);
    
    const actualGameInfo = {
      name: game.name,
      console: allPromisesResolved.find(gameResolve => gameResolve.gameId === game.id)?.promisesPlatform.data,
      genres: allPromisesResolved.find(gameResolve => gameResolve.gameId === game.id)?.promisesGenre.data,
      rating: game.total_rating,
      releaseDate: unixTimeStampToMillis,
      difficulty: 0,
      timeToBeat: {
        main: firstGameHltb?.gameplayMain || 0,
        MainExtra: firstGameHltb?.gameplayMainExtra || 0,
        Completionist: firstGameHltb?.gameplayCompletionist || 0,
      },
    } as GameInfo;

    console.log(actualGameInfo);
    return actualGameInfo;
  });


  return gameInfo;
}

getToken().then(async responseToken => {
  const { access_token, expiresIn, tokenType } = responseToken;

  const requestOptions: ApicalypseConfig = {
    baseURL: "https://api.igdb.com/v4/",
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${access_token}`
    },
  }

  const gamesInfo = await getGameInfo('gta', requestOptions)

  const gameInformationComplete = await getIdInfo(gamesInfo, requestOptions);
});