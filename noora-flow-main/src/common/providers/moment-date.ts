/* eslint-disable prefer-const */
import * as moment from 'moment-jalaali';

// List of Jalaali holidays (you can expand this list)
const jalaaliHolidays: string[] = [
  '1400-01-01', // New Year
  '1400-01-02', // New Year Holiday
  '1400-12-29', // Sizdah Bedar
  '2023-09-19',
  // Add more holidays here
];

export function isJalaaliHoliday(date: string): boolean {
  const jalaaliDate = moment(date, 'YYYY-MM-DD');

  // Convert the input date to Jalaali
  if (!jalaaliDate.isValid()) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD.');
  }

  // const jalaaliDateString = jalaaliDate.format('jYYYY-jMM-jDD');

  // Check if the date is in the list of Jalaali holidays
  return jalaaliHolidays.includes(date);
}

export function gregorianDateTimeToJalali(dateTime: Date) {
  // Load Persian (Jalali) calendar
  moment.loadPersian({ usePersianDigits: false });

  // Convert the date-time string to Jalali format
  const jalaliDateTime = moment(dateTime).format('jYYYY/jMM/jDD HH:mm:ss');

  return jalaliDateTime;
}

export function gregorianToJalaali(gregorianDate: string): string {
  const jalaaliDate = moment(gregorianDate, 'YYYY-MM-DD').format(
    'jYYYY-jMM-jDD',
  );

  return jalaaliDate;
}

export function calculateTimeDifference(time1: string, time2: string) {
  const [hours1, minutes1, seconds1] = time1.split(':').map(Number);
  const [hours2, minutes2, seconds2] = time2.split(':').map(Number);

  const date1 = new Date(0, 0, 0, hours1, minutes1, seconds1);
  const date2 = new Date(0, 0, 0, hours2, minutes2, seconds2);

  const timeDifferenceMs = date2.getTime() - date1.getTime();

  const hoursDiff = Math.floor(timeDifferenceMs / 3600000);
  const minutesDiff = Math.floor((timeDifferenceMs % 3600000) / 60000);
  const secondsDiff = Math.floor((timeDifferenceMs % 60000) / 1000);

  const formattedTimeDifference = `${String(hoursDiff).padStart(
    2,
    '0',
  )}:${String(minutesDiff).padStart(2, '0')}:${String(secondsDiff).padStart(
    2,
    '0',
  )}`;
  return formattedTimeDifference;
}

// Function to pad a number with a leading zero if needed
function padZero(num: number) {
  return (num < 10 ? '0' : '') + num;
}

export function addTwoTimeStrings(timeStr1: string, timeStr2: string) {
  // Split the time strings into hours, minutes, and seconds
  let timeParts1 = timeStr1.split(':');
  let timeParts2 = timeStr2.split(':');

  // Convert the time parts to integers
  let hours1 = parseInt(timeParts1[0]);
  let minutes1 = parseInt(timeParts1[1]);
  let seconds1 = parseInt(timeParts1[2]);

  let hours2 = parseInt(timeParts2[0]);
  let minutes2 = parseInt(timeParts2[1]);
  let seconds2 = parseInt(timeParts2[2]);

  // Add the hours, minutes, and seconds
  let totalHours = hours1 + hours2;
  let totalMinutes = minutes1 + minutes2;
  let totalSeconds = seconds1 + seconds2;

  // Handle carryovers
  if (totalSeconds >= 60) {
    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds %= 60;
  }

  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;
  }

  // if (totalHours > 23) {
  //     totalHours %= 24;
  // }

  // Format the result as a string with leading zeros
  let resultTimeStr =
    padZero(totalHours) +
    ':' +
    padZero(totalMinutes) +
    ':' +
    padZero(totalSeconds);

  return resultTimeStr;
}

export function compareTimes(time1: string, time2: string) {
  const date1 = new Date(`2000-01-01T${time1}`);
  const date2 = new Date(`2000-01-01T${time2}`);

  return date1 > date2;
}

export function getDatesBetween(startDate: any, endDate: any) {
  const dates = [];

  let currentDate = new Date(startDate);
  endDate = new Date(endDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().slice(0, 10)); // Convert Date to yyyy-mm-dd format
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function checkOfficePresence(
  entryExitTimes: string[],
  startTime: string,
  endTime: string,
): boolean {
  // Initialize a flag to check if you were in the office during the time range
  let inOffice = false;

  // Iterate through the entryExitTimes array
  for (let i = 0; i < entryExitTimes.length; i += 2) {
    const entryTime = entryExitTimes[i];
    const exitTime = entryExitTimes[i + 1];

    // Check if the entry and exit times fall within the given time range
    if (entryTime < endTime && exitTime > startTime) {
      // You were in the office for at least 1 minute during the time range
      inOffice = true;
      break; // No need to continue checking
    }
  }

  // Return "yes" if you were in the office, "no" otherwise
  return inOffice ? true : false;
}

export function subtractDurations(timeString1: string, timeString2: string) {
  // Parse the time strings to extract hours, minutes, and seconds

  const [hours1, minutes1, seconds1] = timeString1.split(':').map(Number);
  const [hours2, minutes2, seconds2] = timeString2.split(':').map(Number);

  // Calculate the result duration
  let resultHours = hours1 - hours2;
  let resultMinutes = minutes1 - minutes2;
  let resultSeconds = seconds1 - seconds2;

  // Handle negative values
  if (resultSeconds < 0) {
    resultMinutes -= 1;
    resultSeconds += 60;
  }
  if (resultMinutes < 0) {
    resultHours -= 1;
    resultMinutes += 60;
  }

  // Format the result as a duration string
  const resultString = `${String(resultHours).padStart(2, '0')}:${String(
    resultMinutes,
  ).padStart(2, '0')}:${String(resultSeconds).padStart(2, '0')}`;

  return resultString;
}

export function getCurrentUtcDate() {
  const currentUTCDate = new Date();
  const year = currentUTCDate.getUTCFullYear();
  const month = String(currentUTCDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentUTCDate.getUTCDate()).padStart(2, '0');
  const utcDateString = `${year}-${month}-${day}`;
  return utcDateString;
}

//Input a date and days you to add
export function addDays(date: string, days: number): string {
  const resultDate = new Date(date);
  resultDate.setUTCDate(resultDate.getUTCDate() + days);
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  const utcDateString = `${year}-${month}-${day}`;
  return utcDateString;
}
