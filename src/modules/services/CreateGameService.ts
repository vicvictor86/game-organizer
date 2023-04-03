import { inject, injectable } from "tsyringe";
import { AppError } from "../../shared/errors/AppError";
import { IAPIConsumer } from "../../interfaces/IAPIConsumer";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";


@injectable()
export default class CreateGameService {
  constructor(
    @inject('APIConsumer')
    private APIConsumer: IAPIConsumer,
  ) { }

  public async execute(title : string): Promise<CreatePageResponse[]> {
    const gameInfo = await this.APIConsumer.insertNewGame(title);

    if (!gameInfo) {
      throw new AppError('Could not insert new game', 400);
    }

    return gameInfo;
  }
}