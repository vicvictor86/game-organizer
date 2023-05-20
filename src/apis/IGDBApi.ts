/* eslint-disable camelcase */
import apicalypse, { ApicalypseConfig } from 'apicalypse';

import { getGameTimeToBeat } from './HLTBApi';
import getToken from './auth/getToken';

import { IGDBAPIResponse } from '../interfaces/IGDBAPIResponse';
import { GameInfo } from '../interfaces/GameInfo';
import { AppError } from '../shared/errors/AppError';

async function getRequestOptions(): Promise<ApicalypseConfig> {
  const { access_token } = await getToken();

  const requestOptions: ApicalypseConfig = {
    baseURL: process.env.IGDB_API_BASE_URL,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Client-ID': process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${access_token}`,
    },
  };

  return requestOptions;
}

async function getIdsGameInfo(gameName: string, requestOptions: ApicalypseConfig): Promise<IGDBAPIResponse> {
  const response = apicalypse(requestOptions);
  const apiResponse = await response.fields([
    'name', 'total_rating', 'first_release_date', 'genres', 'language_supports', 'platforms',
  ]).search(gameName).limit(1).request(`${process.env.IGDB_API_BASE_URL}/games`);

  return apiResponse.data[0];
}

async function getIdsSuggestGamesInfo(gameName: string, limit: number, requestOptions: ApicalypseConfig): Promise<IGDBAPIResponse> {
  const response = apicalypse(requestOptions);
  const apiResponse = await response.fields([
    'name', 'total_rating', 'first_release_date', 'genres', 'language_supports', 'platforms',
  ]).search(gameName).limit(limit).request(`${process.env.IGDB_API_BASE_URL}/games`);

  return apiResponse.data;
}

async function getInfosByID(data: IGDBAPIResponse, requestOptions: ApicalypseConfig): Promise<GameInfo> {
  const response = apicalypse(requestOptions);

  const gameGenreFormatted = data.genres?.toString();
  const genresPromise = response.fields('name').where(`id = (${gameGenreFormatted})`).request(`${process.env.IGDB_API_BASE_URL}/genres`);

  const gamePlatformFormatted = data.platforms?.toString();
  const platformsPromise = response.fields('name').where(`id = (${gamePlatformFormatted})`).request(`${process.env.IGDB_API_BASE_URL}/platforms`);

  const unixTimeStampToMillis = new Date(data.first_release_date * 1000);
  const timesToBeatPromise = getGameTimeToBeat(data.name);

  const [genres, platforms, timesToBeat] = await Promise.all([genresPromise, platformsPromise, timesToBeatPromise]);

  const actualGameInfo = {
    name: data.name,
    platforms: platforms.data,
    genres: genres.data,
    rating: data.total_rating,
    releaseDate: unixTimeStampToMillis,
    timeToBeat: {
      main: timesToBeat?.main || 0,
      mainExtra: timesToBeat?.mainExtra || 0,
      completionist: timesToBeat?.completionist || 0,
    },
  } as GameInfo;

  return actualGameInfo;
}

export async function getGameInfo(gameName: string): Promise<GameInfo | undefined> {
  const requestOptions = await getRequestOptions();
  const gamesIdsInfo = await getIdsGameInfo(gameName, requestOptions);

  if (!gamesIdsInfo) {
    throw new AppError('Game not found');
  }

  const gameInfo = await getInfosByID(gamesIdsInfo, requestOptions);

  return gameInfo;
}

export async function getGamesInfo(gameName: string, limit: number): Promise<IGDBAPIResponse | undefined> {
  const requestOptions = await getRequestOptions();
  const gamesIdsInfo = await getIdsSuggestGamesInfo(gameName, limit, requestOptions);

  if (!gamesIdsInfo) {
    throw new AppError('Game not found');
  }

  // const gameInfo = await getInfosByID(gamesIdsInfo, requestOptions);

  return gamesIdsInfo;
}
