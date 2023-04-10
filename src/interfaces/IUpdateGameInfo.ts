import { TimesToBeat } from "./GameInfo";

export interface IUpdateGameInfo {
  page_id: string;
  title: string;
  // status: string;
  timeToBeat: TimesToBeat;
  releaseDate: Date;
  obtained_data: boolean;
}
