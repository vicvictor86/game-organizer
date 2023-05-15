export interface IGDBAPIResponse {
  id: number;
  name: string;
  total_rating: number;
  artworks: number[];
  collection: number;
  first_release_date: number;
  genres: number[] | undefined;
  involved_companies: number[];
  language_supports: number[];
  platforms: number[] | undefined;
}
