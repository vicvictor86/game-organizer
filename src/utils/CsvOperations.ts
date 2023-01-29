import GameInfoInCsv from "../interfaces/GameInfoInCsv";
import GameInfo from "../interfaces/GameInfo";

function formatArrayToStringOnlyWithName(array: any[]): string {
  let arrayInCsv = "";
  array.forEach(arrayItem => {
    arrayInCsv += `${arrayItem.name} / `;
  });

  return arrayInCsv.slice(0, arrayInCsv.lastIndexOf('/'));
}

function formatInfoToCSV(gameInfo: GameInfo): GameInfoInCsv {
  const consoleInCsv = formatArrayToStringOnlyWithName(gameInfo.console);

  const genresInCsv = formatArrayToStringOnlyWithName(gameInfo.genres);

  const gameTimeToBeat = gameInfo.timeToBeat;
  const howLongToBeatInCsv = `Main: ${gameTimeToBeat.main} / Main and Extra: ${gameTimeToBeat.MainExtra} / Completionist: ${gameTimeToBeat.Completionist}`;

  const gameInfoInCsv = {
    ...gameInfo,
    console: consoleInCsv,
    genres: genresInCsv,
    timeToBeat: howLongToBeatInCsv,
  };

  return gameInfoInCsv;
}

export { formatArrayToStringOnlyWithName, formatInfoToCSV };