import { inject, injectable } from "tsyringe";

import { ICreateNotionUserConnectionDTO } from "../../../dtos/ICreateNotionUserConnectionDTO";
import { INotionUserConnectionRepository } from "../../users/infra/repositories/INotionUserConnectionRepository";

import { NotionUserConnection } from "../../users/infra/typeorm/entities/NotionUserConnection";

@injectable()
export class CreateNotionUserConnection {
  constructor(
    @inject("NotionUserConnectionRepository")
    private notionUserConnectionRepository: INotionUserConnectionRepository,
  ) { }

  async execute(data: ICreateNotionUserConnectionDTO): Promise<NotionUserConnection> {
    const notionUserConnection = await this.notionUserConnectionRepository.create(data);

    if (!notionUserConnection) {
      throw new Error("Could not create NotionUserConnection");
    }

    return notionUserConnection;
  }
}