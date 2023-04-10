import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";

export interface IAPIConsumer {
  insertNewGame(title: string): Promise<CreatePageResponse[]>;
  searchGame(title: string): Promise<any>;
  updateNewGamesInfo(): Promise<void>;
}