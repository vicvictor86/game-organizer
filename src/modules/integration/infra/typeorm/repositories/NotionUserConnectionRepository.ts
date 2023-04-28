import { ICreateNotionUserConnectionDTO } from "../../../dtos/ICreateNotionUserConnectionDTO";
import { connectionSource } from "../../../../../shared/infra/typeorm";
import { INotionUserConnectionRepository } from "../../../repositories/INotionUserConnectionRepository";
import { NotionUserConnection } from "../entities/NotionUserConnection";

const userConnectionRepository = connectionSource.getRepository(NotionUserConnection);

export const NotionUserConnectionRepository: INotionUserConnectionRepository = userConnectionRepository.extend({
  async findByOwnerId(ownerId: string): Promise<NotionUserConnection | null> {
    const userConnection = await userConnectionRepository.findOne({
      where: { ownerId },
    });

    return userConnection;
  },

  async findByUserId(userId: string): Promise<NotionUserConnection | null> {
    const userConnection = await userConnectionRepository.findOne({
      where: { userId },
    });

    return userConnection;
  },

  async findByWorkspaceId(workspaceId: string): Promise<NotionUserConnection | null> {
    const userConnection = await userConnectionRepository.findOne({
      where: { workspaceId },
    });

    return userConnection;
  },
  
  async findByAccessToken(accessToken: string): Promise<NotionUserConnection | null> {
    const userConnection = await userConnectionRepository.findOne({
      where: { accessToken },
    });

    return userConnection;
  },

  async findById(id: string): Promise<NotionUserConnection | null> {
    const userConnection = await userConnectionRepository.findOne({
      where: { id },
    });

    return userConnection;
  },

  async create(data: ICreateNotionUserConnectionDTO): Promise<NotionUserConnection> {
    const userConnection = userConnectionRepository.create(data);

    await userConnectionRepository.save(userConnection);

    return userConnection;
  },

  async save(notionUserConnection: NotionUserConnection): Promise<NotionUserConnection> {
    return await userConnectionRepository.save(notionUserConnection);
  },
})