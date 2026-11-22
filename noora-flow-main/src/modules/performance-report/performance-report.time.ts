import * as moment from 'moment-jalaali';

moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

const TEHRAN_OFFSET = 210;

export function tehranNow() {
  return moment().utcOffset(TEHRAN_OFFSET);
}

export function todayKey(): string {
  return tehranNow().format('YYYY-MM-DD');
}

export function parseDateKey(value?: string | null): string {
  if (!value || !value.trim()) return todayKey();
  const datePart = value.trim().split(' ')[0].replace(/-/g, '/');
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(datePart)) {
    const year = Number(datePart.slice(0, 4));
    if (year > 1700) {
      const gregorian = moment(datePart, 'YYYY/MM/DD', true);
      if (gregorian.isValid()) return gregorian.format('YYYY-MM-DD');
    }
    const jalali = moment(datePart, 'jYYYY/jMM/jDD', true);
    if (jalali.isValid()) return jalali.format('YYYY-MM-DD');
  }
  return todayKey();
}

export function dayBounds(dateKey: string) {
  const start = moment(dateKey, 'YYYY-MM-DD').utcOffset(TEHRAN_OFFSET, true);
  const end = start.clone().add(1, 'day');
  return {
    start: start.toDate(),
    end: end.toDate(),
    startMs: start.valueOf(),
    endMs: end.valueOf(),
  };
}

export function shiftDateKey(dateKey: string, days: number): string {
  return moment(dateKey, 'YYYY-MM-DD').add(days, 'day').format('YYYY-MM-DD');
}

export function jalaliMonthStart(dateKey: string): string {
  return moment(dateKey, 'YYYY-MM-DD').startOf('jMonth').format('YYYY-MM-DD');
}

export function eachDateKey(from: string, to: string, limit = 93): string[] {
  const days: string[] = [];
  const cursor = moment(from, 'YYYY-MM-DD');
  const end = moment(to, 'YYYY-MM-DD');
  while (cursor.isSameOrBefore(end, 'day') && days.length < limit) {
    days.push(cursor.format('YYYY-MM-DD'));
    cursor.add(1, 'day');
  }
  return days;
}

export function clockToMinutes(value?: string | null): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function durationFromClocks(
  start?: string | null,
  end?: string | null,
): number | null {
  const startMinutes = clockToMinutes(start);
  const endMinutes = clockToMinutes(end);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }
  return endMinutes - startMinutes;
}

export function durationFromEpoch(
  start?: number | null,
  end?: number | null,
): number | null {
  if (!start || !end || start <= 0 || end <= 0 || end <= start) return null;
  return Math.round((end - start) / 60000);
}

export function formatClock(ms?: number | null): string | null {
  if (!ms || ms <= 0) return null;
  return moment(ms).utcOffset(TEHRAN_OFFSET).format('HH:mm');
}

export function formatDuration(minutes: number | null): string | null {
  if (minutes === null || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) return `${hours} ساعت و ${rest} دقیقه`;
  if (hours) return `${hours} ساعت`;
  return `${rest} دقیقه`;
}

export function toJalaliLabel(dateKey: string): string {
  return moment(dateKey, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
}
