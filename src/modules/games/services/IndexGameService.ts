import { injectable } from 'tsyringe';

import { getGamesInfo } from '../../../apis/IGDBApi';
import { GameInfo } from '../../../interfaces/GameInfo';

interface Request {
  gameTitle: string;
}

@injectable()
export default class IndexGameService {
  public async execute({ gameTitle }: Request): Promise<GameInfo[] | undefined> {
    const gamesInfo = await getGamesInfo(gameTitle, 4);

    return gamesInfo;
  }
}
