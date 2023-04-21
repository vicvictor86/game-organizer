import { HowLongToBeatService } from "howlongtobeat";
import { AppError } from "../shared/errors/AppError";

interface HLTBResponse {
  main: number;
  mainExtra: number;
  completionist: number;
}

const hltbService = new HowLongToBeatService();

export async function getGameTimeToBeat(gameName: string): Promise<HLTBResponse> {
  const hltbResponse = await hltbService.search(gameName);

  if(!hltbResponse) {
    throw new AppError('No game found');
  }

  const firstGameHltb = hltbResponse.at(0);
  
  const response = {
    main: firstGameHltb?.gameplayMain || 0,
    mainExtra: firstGameHltb?.gameplayMainExtra || 0,
    completionist: firstGameHltb?.gameplayCompletionist || 0,
  } as HLTBResponse;

  return response;
}