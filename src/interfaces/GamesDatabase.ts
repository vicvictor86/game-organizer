/* eslint-disable import/no-extraneous-dependencies */
import {
  Relation, Select, Date,
} from 'notion-api-types/responses/properties/database';

export interface GamesDatabase extends Record<string, any> {
  game_title: {
    id: string;
    title: [
      {
        text: {
          content: string;
        }
      }
    ];
  };
  platform: Relation;
  status?: Select;
  rating?: Select;
  completion?: Date;
  time_to_beat: number;
  release_date?: Date;
  completion_date?: Date;
  obtained_data?: boolean;
}
