export interface TimesToBeat {
  main: number;
  MainExtra: number;
  Completionist: number;
}

export default interface GameInfo {
  name: string;
  platform: { id: string, name: string }[];
  genres: { id: string, name: string }[];
  releaseDate: Date;
  timeToBeat: TimesToBeat;
  rating: number;
}