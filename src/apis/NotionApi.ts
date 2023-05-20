import { Client } from '@notionhq/client';
import {
  DatabaseObjectResponse, GetDatabaseResponse, GetPageResponse, PageObjectResponse, PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { AppError } from '../shared/errors/AppError';

import { GameInfo, TimesToBeat } from '../interfaces/GameInfo';
import { SelectOptions } from '../interfaces/SelectOptions';
import { IUpdateGameInfo } from '../interfaces/IUpdateGameInfo';
import { PlatformOptions } from '../interfaces/PlatformOptions';

interface PlatformOptionsResponse {
  platformOptions: PlatformOptions[];

  undefinedPlatform: PlatformOptions;
}

interface Request {
  platformNames: string[];
  releaseDate: string;
  timeToBeat: TimesToBeat;
}

type PageProperties = {
  page: GetPageResponse & { parent: { page_id: string } };
  database: any;
}

type GameProperties = (PageObjectResponse | PartialPageObjectResponse | GetDatabaseResponse) & NotionGameProperties;

interface NotionGameProperties {
  id: string;
  properties: {
    game_title: {
      title: [
        {
          text: {
            content: string;
          }
        }
      ]
    },
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

type IPlatformProperties = (PageObjectResponse | PartialPageObjectResponse | GetDatabaseResponse) & NotionPlatformProperties;

interface NotionPlatformProperties {
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

  private defaultStatusName: string;

  constructor(accessToken: string, defaultStatusName: string, gameDatabaseId?: string, platformDatabaseId?: string) {
    this.notion = new Client({ auth: accessToken });
    this.gameDatabaseId = gameDatabaseId;
    this.platformDatabaseId = platformDatabaseId;
    this.defaultStatusName = defaultStatusName;
  }

  async searchDatabasesIds(gameDatabaseName: string, platformDatabaseName: string) {
    const gameDatabasePromise = this.getDatabaseByName(gameDatabaseName);
    const platformDatabasePromise = this.getDatabaseByName(platformDatabaseName);

    const [gameDatabase, platformDatabase] = await Promise.all([gameDatabasePromise, platformDatabasePromise]);

    return { gameDatabaseId: gameDatabase.id, platformDatabaseId: platformDatabase.id };
  }

  async readItem(title: string): Promise<GameProperties | undefined> {
    if (this.gameDatabaseId) {
      const gamesInDatabase = await this.notion.databases.query({
        database_id: this.gameDatabaseId,
      });

      const gamesWithProperties = gamesInDatabase.results.map((result) => {
        const resultWithProperties = result as GameProperties;

        return resultWithProperties;
      });

      const game = gamesWithProperties.find((gameWithProperties) => gameWithProperties.properties.game_title.title[0].text.content === title);

      return game;
    }

    return undefined;
  }

  async getAllDatabases(): Promise<any[]> {
    const allDataAvailable = await this.notion.search({});

    console.log(allDataAvailable.results);

    const databases = allDataAvailable.results.filter((result) => result.object === 'database');

    return databases;
  }

  async getAllPages(): Promise<any[]> {
    const pages = await this.notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
    });

    return pages.results;
  }

  async getDatabaseByName(name: string): Promise<DatabaseObjectResponse> {
    const database = await this.notion.search({
      query: name,
      filter: {
        value: 'database',
        property: 'object',
      },
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

  async getDatabaseByTopHierarchyPageId(pageId: string) {
    const databases = await this.getAllDatabases();

    const databaseParents = databases.map((database) => ({ parent: database.parent, database }));

    const databaseParentInfoPromise = databaseParents.map(async (databaseParent) => {
      const page = await this.notion.pages.retrieve({
        page_id: databaseParent.parent.page_id,
      });

      return { page, database: databaseParent.database };
    });

    const databaseParentInfo = await Promise.all(databaseParentInfoPromise) as PageProperties[];

    return databaseParentInfo.filter((databaseParent) => databaseParent.page.parent.page_id === pageId).map((databaseParent) => databaseParent.database);
  }

  async getTopHierarchyPageIdByDatabaseId(databaseId: string) {
    const databases = await this.getAllDatabases();

    const databaseParents = databases.map((database) => ({ parent: database.parent, database }));

    const databaseParentInfoPromise = databaseParents.map(async (databaseParent) => {
      const page = await this.notion.pages.retrieve({
        page_id: databaseParent.parent.page_id,
      });

      return { page, database: databaseParent.database };
    });

    const databaseParentInfo = await Promise.all(databaseParentInfoPromise) as PageProperties[];

    return databaseParentInfo.find((databaseParent) => databaseParent.database.id === databaseId)?.page.parent;
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
    }

    const queryAllPlatforms = await this.notion.databases.query({
      database_id: this.platformDatabaseId,
    });

    const entries = queryAllPlatforms.results;

    const platformsIdsWithName = entries.map((entry) => {
      const entryWithProperties = entry as IPlatformProperties;

      return {
        id: entryWithProperties.id,
        name: entryWithProperties.properties.name.title[0].text.content,
      } as PlatformOptions;
    });

    const undefinedPlatform = platformsIdsWithName.find((platform) => platform.name === 'Undefined Platform');

    if (!undefinedPlatform) {
      throw new AppError('Error: No undefined platform, please create one');
    }

    return { platformOptions: platformsIdsWithName, undefinedPlatform };
  }

  async getStatusOptions(): Promise<SelectOptions[]> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    }

    const gameDatabaseInfo = await this.notion.databases.retrieve({
      database_id: this.gameDatabaseId,
    });

    const gamesWithProperties = gameDatabaseInfo as GameProperties;

    const statusOptions = gamesWithProperties.properties.status.select.options;

    return statusOptions;
  }

  async getPageById(id: string): Promise<GetPageResponse> {
    const page = this.notion.pages.retrieve({
      page_id: id,
    });

    return page;
  }

  async getPagesByIds(ids: string[]): Promise<GetPageResponse[]> {
    const pagesPromises = ids.map(async (id) => {
      const pagePromise = this.notion.pages.retrieve({
        page_id: id,
      });

      return pagePromise;
    });

    const pages = await Promise.all(pagesPromises);

    return pages;
  }

  async insertGame(gameName: string, gameInfo: Request): Promise<GameInfo | undefined> {
    if (!this.gameDatabaseId || !this.platformDatabaseId) {
      throw new AppError('Error: No database ID');
    }

    const gameDatabaseInfoPromise = this.notion.databases.retrieve({
      database_id: this.gameDatabaseId,
    });
    const allGamesInDatabasePromise = this.getAllGames();

    const [gameDatabaseInfo, allGamesInDatabase] = await Promise.all([gameDatabaseInfoPromise, allGamesInDatabasePromise]);

    const allGamesInDatabaseWithProperties = allGamesInDatabase as GameProperties[];

    const gameAlreadyExists = allGamesInDatabaseWithProperties.find((game) => game.properties.game_title.title[0].text.content === gameName);

    if (gameAlreadyExists) {
      throw new AppError('Game already exists');
    }

    const gamesWithProperties = gameDatabaseInfo as GameProperties;

    const statusOptions = gamesWithProperties.properties.status.select.options;
    const { platformOptions, undefinedPlatform } = await this.getPlatformsOptions();

    if (!platformOptions) {
      throw new AppError('Error: No platform options');
    }

    const platformsToAdd = platformOptions.filter((platformOption) => gameInfo.platformNames.some((platformName) => platformName === platformOption.name));

    const platformsId = platformsToAdd.map((platform) => ({
      id: platform.id,
    }));

    const selectId = statusOptions.find((status) => status.name === this.defaultStatusName)?.id;

    const select = selectId ? { id: selectId } : { name: this.defaultStatusName };

    await this.notion.pages.create({
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
          relation: platformsId || [{ id: undefinedPlatform.id }],
        },
        status: {
          select,
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
        },
      },
    });

    console.log(`The game ${gameName} was inserted with success!`);

    const gameAdded = {
      name: gameName,
      platforms: platformsToAdd,
      timeToBeat: gameInfo.timeToBeat,
      releaseDate: new Date(gameInfo.releaseDate),
    } as GameInfo;

    return gameAdded;
  }

  async updateGameInfo(game: IUpdateGameInfo, statusOptions: SelectOptions[], statusName?: string): Promise<void> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    }

    const status = statusOptions.find((statusOption) => statusOption.name === statusName)?.id;
    const wantToPlayId = statusOptions.find((statusOption) => statusOption.name === 'Want to Play')?.id;
    const releaseDateWithoutTime = new Date(game.releaseDate).toISOString().substring(0, 10);

    const platformsToAdd = game.platform.map((platform) => ({
      id: platform.id,
    }));

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
          number: game.timeToBeat.mainExtra,
        },
        release_date: {
          date: {
            start: releaseDateWithoutTime,
          },
        },
        obtained_data: {
          checkbox: true,
        },
      },
    });
  }

  async searchForNewGames(): Promise<PageObjectResponse[]> {
    if (!this.gameDatabaseId) {
      throw new AppError('Error: No database ID');
    }

    const queryAllNewGames = await this.notion.databases.query({
      database_id: this.gameDatabaseId,
      filter: {
        property: 'obtained_data',
        checkbox: {
          equals: false,
        },
      },
    });

    return queryAllNewGames.results as PageObjectResponse[];
  }
}
