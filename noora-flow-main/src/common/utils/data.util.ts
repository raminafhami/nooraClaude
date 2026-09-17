import { isValidObjectId } from 'mongoose';
import { from, mergeMap, of, toArray, zip, groupBy } from 'rxjs';

export function generateVerificationCode(isDev: boolean): string {
  if (isDev) {
    return '000000';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function extractDistinctValues(array: object[], key: string): any[] {
  const distinctKeys: any[] = [];
  let value: any;
  array.forEach((elem) => {
    value = elem[key];
    if (isValidObjectId(value)) {
      value = value.toString();
    }
    if (!distinctKeys.includes(value)) distinctKeys.push(value);
  });

  return distinctKeys;
}

export function flattenObject(obj, parentKey = '', result = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

export function flattenObjectIrreversible(obj, result = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObjectIrreversible(obj[key], result);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export function extractProperties(obj, keys) {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

export function findMaxLength(data: string[]): number {
  let length = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i].toString().length > length)
      length = data[i].toString().length;
  }
  if (length > 100) return 100;
  return length;
}

export function objectValueIsTheSame(data: any[], field: string) {
  const firstValue = getValueByPath(data[0], field);
  for (const element of data) {
    if (
      getValueByPath(element, field) !== firstValue ||
      getValueByPath(element, field) === undefined ||
      getValueByPath(element, field) === null
    ) {
      return false;
    }
  }
  return true;
}

//getting value of nested object
function getValueByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function groupBySimple(array, key) {
  return array.reduce((result, currentValue) => {
    // Get the value of the key to group by
    const groupKey = currentValue[key];

    // Initialize the group if it doesn't exist
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    // Add the current object to the group
    result[groupKey].push(currentValue);

    return result;
  }, {});
}

export function groupByRxjs(array, key) {
  let groupedItems: any[] = [];

  from(array)
    .pipe(
      groupBy(
        (item) => item[key],
        (i) => i,
      ),
      mergeMap((group) => zip(of(group.key), group.pipe(toArray()))),
    )
    .subscribe((result) => groupedItems.push(result));
  return groupedItems;
}

export function numberToPersianText(number: number) {
  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = [
    '',
    'ده',
    'بیست',
    'سی',
    'چهل',
    'پنجاه',
    'شصت',
    'هفتاد',
    'هشتاد',
    'نود',
  ];
  const teens = [
    'ده',
    'یازده',
    'دوازده',
    'سیزده',
    'چهارده',
    'پانزده',
    'شانزده',
    'هفده',
    'هجده',
    'نوزده',
  ];
  const hundreds = [
    '',
    'صد',
    'دویست',
    'سیصد',
    'چهارصد',
    'پانصد',
    'ششصد',
    'هفتصد',
    'هشتصد',
    'نهصد',
  ];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

  if (number === 0) return 'صفر';

  function convertThreeDigits(num) {
    let result = '';

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;

    if (hundred > 0) result += hundreds[hundred] + ' و ';
    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      if (ten > 0) result += tens[ten] + ' و ';
      if (one > 0) result += ones[one];
    }

    return result.trim().replace(/ و $/, ''); // Remove trailing "و" if present
  }

  const groups = [];
  let groupIndex = 0;

  while (number > 0) {
    groups[groupIndex++] = number % 1000;
    number = Math.floor(number / 1000);
  }

  const parts = groups.map((group, index) => {
    if (group === 0) return '';
    const scale = scales[index];
    return convertThreeDigits(group) + (scale ? ' ' + scale : '');
  });

  return parts
    .reverse()
    .filter((part) => part !== '')
    .join(' و ')
    .trim();
}

export function today(format: string, location: string, zone?: string) {
  // Create a Date object and use Intl.DateTimeFormat to format it for Tehran
  const now = new Date();

  // Format the date based on the location and style
  const formatter = new Intl.DateTimeFormat(location, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: zone,
  });

  return formatter.format(now);
}

export function daysBetweenDates(date1, date2) {
  // Convert dates to milliseconds
  const ms1 = date1.getTime();
  const ms2 = date2.getTime();

  // Calculate difference in milliseconds
  const diffInMs = Math.abs(ms2 - ms1);

  // Convert milliseconds to days
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}
