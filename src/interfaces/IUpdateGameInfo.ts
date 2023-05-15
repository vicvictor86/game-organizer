import { TimesToBeat } from './GameInfo';
import { PlatformOptions } from './PlatformOptions';

export interface IUpdateGameInfo {
  page_id: string;
  title: string;
  timeToBeat: TimesToBeat;
  releaseDate: Date;
  platform: PlatformOptions[];
  obtained_data: boolean;
}
