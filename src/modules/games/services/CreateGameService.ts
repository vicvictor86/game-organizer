import { AppError } from "../../../shared/errors/AppError";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { APIConsumer } from "../../../apis/APIConsumer";
import { inject, injectable } from "tsyringe";
import { INotionUserConnectionRepository } from "../../integration/repositories/INotionUserConnectionRepository";

@injectable()
export default class CreateGameService {
  constructor(
    @inject("NotionUserConnectionRepository")
    private notionUserConnectionRepository: INotionUserConnectionRepository,
  ) { }

  public async execute(title: string, token: string): Promise<CreatePageResponse | undefined> {
    const userConnection = await this.notionUserConnectionRepository.findByAccessToken(token);

    if(!userConnection) {
      throw new AppError('User not found', 400);
    }

    const { gameDatabaseId, platformDatabaseId } = userConnection;

    const apiConsumer = new APIConsumer(token, gameDatabaseId, platformDatabaseId);

    const gameInfo = await apiConsumer.insertNewGame(title);

    if (!gameInfo) {
      throw new AppError('Could not insert new game', 400);
    }

    return gameInfo;
  }
}