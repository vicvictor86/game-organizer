import { HowLongToBeatService } from "howlongtobeat";

interface HLTBResponse {
  main: number;
  MainExtra: number;
  Completionist: number;
}

const hltbService = new HowLongToBeatService();

export async function getGameTimeToBeat(gameName: string): Promise<HLTBResponse | undefined> {
  const hltbResponse = await hltbService.search(gameName);

  if(!hltbResponse) {
    console.log('No game found');
    return undefined;
  }

  const firstGameHltb = hltbResponse.at(0);
  
  const response = {
    main: firstGameHltb?.gameplayMain || 0,
    MainExtra: firstGameHltb?.gameplayMainExtra || 0,
    Completionist: firstGameHltb?.gameplayCompletionist || 0,
  } as HLTBResponse;

  return response;
}