import { Client } from "@notionhq/client";
import { AppError } from "../shared/errors/AppError";
import { TimesToBeat } from "../interfaces/GameInfo";
import { SelectOptions } from '../interfaces/SelectOptions';
import { CreatePageResponse, DatabaseObjectResponse, PageObjectResponse, SearchResponse } from "@notionhq/client/build/src/api-endpoints";
import { IUpdateGameInfo } from "../interfaces/IUpdateGameInfo";
import { PlatformOptions } from "../interfaces/PlatformOptions";

interface PlatformOptionsResponse {
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

export class NotionApi {
  private notion: Client;
  private gameDatabaseId: string | undefined;
  private platformDatabaseId: string | undefined;

  constructor(accessToken: string, gameDatabaseId?: string, platformDatabaseId?: string) {
    this.notion = new Client({ auth: accessToken });
    this.gameDatabaseId = gameDatabaseId;
    this.platformDatabaseId = platformDatabaseId;
  }

  async searchDatabasesIds(gameDatabaseName: string, platformDatabaseName: string) {
    const gameDatabasePromise = this.getDatabaseByName(gameDatabaseName);
    const platformDatabasePromise = this.getDatabaseByName(platformDatabaseName);

    const [gameDatabase, platformDatabase] = await Promise.all([gameDatabasePromise, platformDatabasePromise]);

    return { gameDatabaseId: gameDatabase.id, platformDatabaseId: platformDatabase.id };
  }

  async readItem(title: string) {
    if (this.gameDatabaseId) {
      const gamesInDatabase = await this.notion.databases.query({
        database_id: this.gameDatabaseId,
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

  async getDatabaseByName(name: string): Promise<DatabaseObjectResponse> {
    const database = await this.notion.search({
      query: name,
      filter: {
        value: 'database',
        property: 'object',
      }
    });

    const { id, object } = database.results[0];

    if (object !== 'database') {
      throw new AppError('The name provided is not a database');
    }

    if (!id) {
      throw new AppError('No database ID');
    }

    return database.results[0] as DatabaseObjectResponse;
  }

  async getAllGames(): Promise<PageObjectResponse[]> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    }

    const gamesInDatabase = await this.notion.databases.query({
      database_id: this.gameDatabaseId,
    });

    return gamesInDatabase.results as PageObjectResponse[];
  }

  async getPlatformsOptions(): Promise<PlatformOptionsResponse> {
    if (!this.platformDatabaseId) {
      throw new AppError('Error: No database ID');
    };

    const queryAllPlatforms = await this.notion.databases.query({
      database_id: this.platformDatabaseId,
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

  async getStatusOptions(): Promise<SelectOptions[]> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    };

    const gameDatabaseInfo = await this.notion.databases.retrieve({
      database_id: this.gameDatabaseId,
    });

    const gamesAny = gameDatabaseInfo as any;
    const gamesWithProperties = gamesAny as gamesProperties;

    const statusOptions = gamesWithProperties.properties.status.select.options;

    return statusOptions;
  }

  async insertGame(gameName: string, gameInfo: Request): Promise<CreatePageResponse | undefined> {
    if (!this.gameDatabaseId || !this.platformDatabaseId) {
      throw new AppError('Error: No database ID');
    };

    const gameDatabaseInfo = await this.notion.databases.retrieve({
      database_id: this.gameDatabaseId,
    });

    const gamesAny = gameDatabaseInfo as any;
    const gamesWithProperties = gamesAny as gamesProperties;

    const statusOptions = gamesWithProperties.properties.status.select.options;
    const { platformOptions, undefinedPlatform } = await this.getPlatformsOptions();

    if (!platformOptions) {
      throw new AppError('Error: No platform options');
    };

    const platformId = platformOptions.find(platformOption => gameInfo.platformNames.some(platformName => platformName === platformOption.name))?.id;

    const statusId = statusOptions.find(status => status.name === 'Want to Play')?.id || statusOptions[0].id

    const response = await this.notion.pages.create({
      parent: {
        database_id: this.gameDatabaseId,
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
        obtained_data: {
          checkbox: true,
        }
      },
    });

    console.log(`The game ${gameName} inserted with success!`)

    return response;
  }

  async updateGameInfo(game: IUpdateGameInfo, statusOptions: SelectOptions[], statusName?: string): Promise<void> {
    if (!this.gameDatabaseId) {
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

    await this.notion.pages.update({
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

  async searchForNewGames(): Promise<PageObjectResponse[]> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    };

    const queryAllNewGames = await this.notion.databases.query({
      database_id: this.gameDatabaseId,
      filter: {
        property: 'obtained_data',
        checkbox: {
          equals: false,
        },
      }
    });

    return queryAllNewGames.results as PageObjectResponse[];
  }

}

