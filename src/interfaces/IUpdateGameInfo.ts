import { PlatformOptions } from "../apis/NotionApi";
import { TimesToBeat } from "./GameInfo";

export interface IUpdateGameInfo {
  page_id: string;
  title: string;
  // status: string;
  timeToBeat: TimesToBeat;
  releaseDate: Date;
  platform: PlatformOptions[];
  obtained_data: boolean;
}
