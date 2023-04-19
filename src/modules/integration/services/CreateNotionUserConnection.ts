import { inject, injectable } from "tsyringe";
import { NotionApi } from "../../../apis/NotionApi";

import { ICreateNotionUserConnectionDTO } from "../../../dtos/ICreateNotionUserConnectionDTO";
import { INotionUserConnectionRepository } from "../../users/infra/repositories/INotionUserConnectionRepository";

import { NotionUserConnection } from "../../users/infra/typeorm/entities/NotionUserConnection";

interface Request {
  accessToken: string;
  botId: string;
  duplicateTemplateId?: string;
  ownerId: string;
  workspaceIcon?: string;
  workspaceId: string;
  workspaceName?: string;
}

@injectable()
export class CreateNotionUserConnection {
  constructor(
    @inject("NotionUserConnectionRepository")
    private notionUserConnectionRepository: INotionUserConnectionRepository,
  ) { }

  async execute(data: Request): Promise<NotionUserConnection> {
    if (!data.accessToken) {
      throw new Error("Access Token is required");
    }

    const notionApi = new NotionApi(data.accessToken);
    const { gameDatabaseId, platformDatabaseId } = await notionApi.searchDatabasesIds("Games Database", "Platforms Database");

    const dataWithDatabases = { ...data, gameDatabaseId, platformDatabaseId } as ICreateNotionUserConnectionDTO;

    const notionUserConnection = await this.notionUserConnectionRepository.create(dataWithDatabases);

    if (!notionUserConnection) {
      throw new Error("Could not create NotionUserConnection");
    }

    return notionUserConnection;
  }
}