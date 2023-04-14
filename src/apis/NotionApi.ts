import { Client } from "@notionhq/client";
import { AppError } from "../shared/errors/AppError";
import { TimesToBeat } from "../interfaces/GameInfo";
import { SelectOptions } from '../interfaces/SelectOptions';
import { CreatePageResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { IUpdateGameInfo } from "../interfaces/IUpdateGameInfo";

export interface PlatformOptions {
  id: string;

  name: string;
}

export interface PlatformOptionsResponse {
  platformOptions: PlatformOptions[];

  undefinedPlatform: PlatformOptions;
}

interface Request {
  platformNames: string[];
  releaseDate: string;
  timeToBeat: TimesToBeat;
}

interface gamesProperties {
  id: string;
  properties: {
    title: string,
    platform: string,
    status: {
      select: {
        options: SelectOptions[];
      }
    },
    time_to_beat: number,
    release_date: string,
  }
}

interface IPlatformProperties {
  id: string,
  properties: {
    name: {
      title: [
        {
          text: {
            content: string;
          }
        }
      ]
    }
  }
}

const notion = new Client({
  auth: process.env.NOTION_KEY,
})

const databaseGameID = process.env.NOTION_GAME_DATABASE_ID;
const databasePlatformID = process.env.NOTION_PLATFORM_DATABASE_ID;

export async function readItem(title: string) {
  if (databaseGameID) {
    const gamesInDatabase = await notion.databases.query({
      database_id: databaseGameID,
    });

    const gamesWithProperties = gamesInDatabase.results.map(result => {
      const resultAny = result as any;
      const resultWithProperties = resultAny as gamesProperties;

      return resultWithProperties;
    });

    const game = gamesWithProperties.find(game => game.properties.title === title);

    return game;
  }
}

export async function getAllGames(): Promise<PageObjectResponse[]> {
  if (!databaseGameID) {
    console.log('Error: No database ID');
    throw new AppError('Error: No database ID');
  }

  const gamesInDatabase = await notion.databases.query({
    database_id: databaseGameID,
  });

  return gamesInDatabase.results as PageObjectResponse[];
}

export async function getPlatformsOptions(): Promise<PlatformOptionsResponse> {
  if (!databasePlatformID) {
    console.log('Error: No database ID');
    throw new AppError('Error: No database ID');
  };

  const queryAllPlatforms = await notion.databases.query({
    database_id: databasePlatformID,
  });

  const entries = queryAllPlatforms.results;

  const platformsIdsWithName = entries.map(entry => {
    const entryAny = entry as any;
    const entryWithProperties = entryAny as IPlatformProperties;

    return {
      id: entryWithProperties.id,
      name: entryWithProperties.properties.name.title[0].text.content,
    } as PlatformOptions;
  });

  const undefinedPlatform = platformsIdsWithName.find(platform => platform.name === 'Undefined Platform');

  if (!undefinedPlatform) {
    throw new AppError('Error: No undefined platform, please create one');
  }

  return { platformOptions: platformsIdsWithName, undefinedPlatform };
}

export async function getStatusOptions(): Promise<SelectOptions[]> {
  if (!databaseGameID) {
    console.log('Error: No database ID');
    throw new AppError('Error: No database ID');
  };

  const gameDatabaseInfo = await notion.databases.retrieve({
    database_id: databaseGameID,
  });

  const gamesAny = gameDatabaseInfo as any;
  const gamesWithProperties = gamesAny as gamesProperties;

  const statusOptions = gamesWithProperties.properties.status.select.options;

  return statusOptions;
}

export async function insertGame(gameName: string, gameInfo: Request): Promise<CreatePageResponse | undefined> {
  if (!databaseGameID || !databasePlatformID) {
    console.log('Error: No database ID');
    return undefined;
  };

  const gameDatabaseInfo = await notion.databases.retrieve({
    database_id: databaseGameID,
  });

  const gamesAny = gameDatabaseInfo as any;
  const gamesWithProperties = gamesAny as gamesProperties;

  const statusOptions = gamesWithProperties.properties.status.select.options;
  const { platformOptions, undefinedPlatform } = await getPlatformsOptions();

  if (!platformOptions) {
    throw new AppError('Error: No platform options');
  };

  const platformId = platformOptions.find(platformOption => gameInfo.platformNames.some(platformName => platformName === platformOption.name))?.id;

  const statusId = statusOptions.find(status => status.name === 'Want to Play')?.id || statusOptions[0].id

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
            id: platformId || undefinedPlatform.id,
          },
        ],
      },
      status: {
        select: {
          id: statusId,
        },
      },
      time_to_beat: {
        number: gameInfo.timeToBeat.main,
      },
      release_date: {
        date: {
          start: gameInfo.releaseDate,
        },
      },
    },
  });

  console.log(`The game ${gameName} inserted with success!`)

  return response;
}

export async function updateGameInfo(game: IUpdateGameInfo, statusOptions: SelectOptions[], statusName?: string): Promise<void> {
  if (!databaseGameID) {
    console.log('Error: No database ID');
    throw new AppError('Error: No database ID');
  };

  const status = statusOptions.find(status => status.name === statusName)?.id;
  const wantToPlayId = statusOptions.find(status => status.name === 'Want to Play')?.id;
  const releaseDateWithoutTime = new Date(game.releaseDate).toISOString().substring(0, 10);

  const platformsToAdd = game.platform.map(platform => {
    return {
      id: platform.id,
    }
  });

  await notion.pages.update({
    page_id: game.page_id,
    properties: {
      game_title: {
        title: [
          {
            type: 'text',
            text: {
              content: game.title,
            },
          },
        ],
      },
      status: {
        select: {
          id: status || wantToPlayId || statusOptions[0].id,
        },
      },
      platform: {
        relation: platformsToAdd,
      },
      time_to_beat: {
        number: game.timeToBeat.MainExtra,
      },
      release_date: {
        date: {
          start: releaseDateWithoutTime,
        },
      },
      obtained_data: {
        checkbox: true,
      }
    }
  });
}

export async function searchForNewGames(): Promise<PageObjectResponse[]> {
  if (!databaseGameID) {
    console.log('Error: No database ID');
    throw new AppError('Error: No database ID');
  };

  const queryAllNewGames = await notion.databases.query({
    database_id: databaseGameID,
    filter: {
      property: 'obtained_data',
      checkbox: {
        equals: false,
      },
    }
  });

  return queryAllNewGames.results as PageObjectResponse[];
}