import moment from "moment-jalaali";
import { convertPersianNumbersToEnglish } from "./convertPersianNumbersToEnglish";

export function getDatesIngregorian(dates: string[]): string[] {
  const allDates: string[] = dates.map((date) =>
    moment(convertPersianNumbersToEnglish(date), "jYYYY/jMM/jDD")
      .locale("en")
      .format("YYYY-MM-DD")
  );
  return allDates;
}
