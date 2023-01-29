export default interface GameInfo {
  name: string;
  console: { id: string, name: string }[];
  genres: { id: string, name: string }[];
  releaseDate: Date;
  timeToBeat: {
    main: number;
    MainExtra: number;
    Completionist: number;
  };
  rating: number;
  difficulty: number;
}