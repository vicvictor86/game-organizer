import GameInfo from "./GameInfo";

export interface IAPIConsumer {
  insertNewGame(title: string): Promise<GameInfo | undefined>;
  searchGame(title: string): Promise<any>;
  updateNewGamesInfo(): Promise<void>;
}