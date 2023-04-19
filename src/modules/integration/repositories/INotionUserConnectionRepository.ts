import { ICreateNotionUserConnectionDTO } from "../dtos/ICreateNotionUserConnectionDTO";
import { NotionUserConnection } from "../infra/typeorm/entities/NotionUserConnection";

export interface INotionUserConnectionRepository {
  findById(id: string): Promise<NotionUserConnection | null>;
  findByAccessToken(accessToken: string): Promise<NotionUserConnection | null>;
  findByOwnerId(ownerId: string): Promise<NotionUserConnection | null>;
  findByWorkspaceId(workSpaceId: string): Promise<NotionUserConnection | null>;
  create(data: ICreateNotionUserConnectionDTO): Promise<NotionUserConnection>;
  save(notionUserConnection: NotionUserConnection): Promise<NotionUserConnection>;
}