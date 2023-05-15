import { SelectOptions } from './SelectOptions';

interface NotionDatabaseResponse {
  id: string;
  properties: {
    game_title: {
      title: [
        {
          text: {
            content: string;
          }
        }
      ]
    },
    platform: string,
    status: {
      select: {
        options: SelectOptions[];
      }
    },
    time_to_beat: number,
    release_date: string,
  }
}
