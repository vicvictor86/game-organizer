import { AppError } from "../../../shared/errors/AppError";
import { APIConsumer } from "../../../apis/APIConsumer";
import { inject, injectable } from "tsyringe";
import { INotionUserConnectionRepository } from "../../integration/repositories/INotionUserConnectionRepository";
import GameInfo from "../../../interfaces/GameInfo";

@injectable()
export default class CreateGameService {
  constructor(
    @inject("NotionUserConnectionRepository")
    private notionUserConnectionRepository: INotionUserConnectionRepository,
  ) { }

  public async execute(title: string, userId: string): Promise<GameInfo | undefined> {
    const userConnection = await this.notionUserConnectionRepository.findByUserId(userId);

    if(!userConnection) {
      throw new AppError('User not found', 400);
    }

    const { accessToken } = userConnection;

    const { gameDatabaseId, platformDatabaseId } = userConnection;

    const apiConsumer = new APIConsumer(accessToken, gameDatabaseId, platformDatabaseId);

    const gameInfo = await apiConsumer.insertNewGame(title);

    if (!gameInfo) {
      throw new AppError('Could not insert new game', 400);
    }

    return gameInfo;
  }
}