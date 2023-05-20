import { injectable } from 'tsyringe';

import { getGamesInfo } from '../../../apis/IGDBApi';
import { IGDBAPIResponse } from '../../../interfaces/IGDBAPIResponse';

interface Request {
  gameTitle: string;
}

@injectable()
export default class IndexGameService {
  public async execute({ gameTitle }: Request): Promise<IGDBAPIResponse | undefined> {
    const gamesInfo = await getGamesInfo(gameTitle, 4);

    return gamesInfo;
  }
}
