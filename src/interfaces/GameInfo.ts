export default interface GameInfo {
  name: string;
  console: string[];
  genres: string[];
  // type: string;
  releaseDate: Date;
  timeToBeat: {
    main: number;
    MainExtra: number;
    Completionist: number;
  };
  rating: number;
  difficulty: number;
}