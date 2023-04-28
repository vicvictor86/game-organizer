export interface TimesToBeat {
  main: number;
  mainExtra: number;
  completionist: number;
}

export default interface GameInfo {
  name: string;
  platforms: { id: string, name: string }[];
  genres: { id: string, name: string }[];
  releaseDate: Date;
  timeToBeat: TimesToBeat;
  rating: number;
}