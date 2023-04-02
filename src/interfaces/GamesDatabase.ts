export interface GamesDatabase {
  title: string;
  platform: string;
  status?: string;
  rating?: string;
  completion?: Date;
  time_to_beat: number;
  release_date?: Date;
  completion_date?: Date;
}