import 'dotenv/config';
import apicalypse, { ApicalypseConfig } from "apicalypse";
import { HowLongToBeatService, HowLongToBeatEntry } from 'howlongtobeat'

import APIResponse from './interfaces/APIResponse';
import GameInfo from './interfaces/GameInfo';
import { SelectOptions } from './interfaces/SelectOptions';

import getToken from './auth/getToken';

import { Client } from "@notionhq/client";

const hltbService = new HowLongToBeatService();
const notion = new Client({
  auth: process.env.NOTION_KEY,
})
const databaseGameID = process.env.NOTION_GAME_DATABASE_ID;
const databasePlatformID = process.env.NOTION_PLATFORM_DATABASE_ID;

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
    const hltbResponse = await hltbService.search(game.name);
    const firstGameHltb = hltbResponse.at(0);

    const actualGameInfo = {
      name: game.name,
      console: gamesGenresAndPlatform.find(gameResolve => gameResolve.gameId === game.id)?.promisesPlatform.data,
      genres: gamesGenresAndPlatform.find(gameResolve => gameResolve.gameId === game.id)?.promisesGenre.data,
      rating: game.total_rating,
      releaseDate: unixTimeStampToMillis,
      difficulty: 0,
      timeToBeat: {
        main: firstGameHltb?.gameplayMain || 0,
        MainExtra: firstGameHltb?.gameplayMainExtra || 0,
        Completionist: firstGameHltb?.gameplayCompletionist || 0,
      },
    } as GameInfo;

    return actualGameInfo;
  });

  const gamesInfo = await Promise.all(gameInfoPromises);

  return gamesInfo;
}

async function insertNewGameToExcel(gameName: string, requestOptions: ApicalypseConfig) {
  const gamesInfo = await getGameInfo(gameName, requestOptions);

  const gameInformationComplete = await getInfosByID(gamesInfo, requestOptions);



  // gamesInfoInCsv.forEach(async gameInfo => {

  // });
}

async function readItem() {
  console.log(databaseGameID)
  if (databaseGameID) {
    await notion.databases.query({
      database_id: databaseGameID,
    }).then(response => {
      console.log(response.results[2].properties.platform)
    })
  }
}

async function getPlatformsOptions(){
  if(!databasePlatformID) {
    console.log('Error: No database ID');
    return;
  };

  const queryAllPlatforms = await notion.databases.query({
    database_id: databasePlatformID,
  });

  const entries = queryAllPlatforms.results;

  const platformsIdsWithName = entries.map(entry => {
    return {
      id: entry.id,
      name: entry.properties.name.title[0].text.content as string,
    }
  });

  return platformsIdsWithName;
}

async function insertGame(gameName: string, platformName: string) {
  if (!databaseGameID || !databasePlatformID) {
    console.log('Error: No database ID');
    return;
  };

  const gameDatabaseInfo = await notion.databases.retrieve({
    database_id: databaseGameID,
  });

  const statusOptions = gameDatabaseInfo.properties.status.select.options as SelectOptions[];
  const platformOptions = await getPlatformsOptions();
  
  if(!platformOptions) {
    console.log('Error: No platform options');
    return;
  };

  const platformId = platformOptions.find(platformOption => platformOption.name === platformName)?.id;
  const statusId = statusOptions.find(status => status.name === 'Want to Play')?.id || statusOptions[0].id

  if(!platformId) {
    console.log('Error: No platform ID');
    return;
  };

  const response = await notion.pages.create({
    parent: {
      database_id: databaseGameID,
    },
    properties: {
      title: {
        title: [
          {
            type: 'text',
            text: {
              content: gameName,
            },
          },
        ],
      },
      platform: {
        relation: [
          {
            id: platformId,
          },
        ],
      },
      status: {
        select: {
          id: statusId,
        },
      },
      release_date: {
        date: {
          start: '2021-01-01',
        },
      },
    },
  });

  console.log(response);
}

getToken().then(async responseToken => {
  // const { access_token, expiresIn, tokenType } = responseToken;

  // const requestOptions: ApicalypseConfig = {
  //   baseURL: process.env.API_BASE_URL,
  //   method: 'POST',
  //   headers: {
  //     'Accept': 'application/json',
  //     'Client-ID': process.env.CLIENT_ID,
  //     'Authorization': `Bearer ${access_token}`
  //   },
  // };

  // await readItem();
  await insertGame('sonic', "PlayStation 4");
});