import {
  FormQuestion,
  FormQuestionType,
  NON_ANSWERABLE_QUESTION_TYPES,
} from '../schemas/form-version.schema';

// Server-side validation of a single answer against its question (spec 7:
// "نوع پاسخ سمت سرور اعتبارسنجی شود"). Returns a Persian error message, or
// null when the value is acceptable. Empty values are only rejected for
// required questions; type rules apply whenever a value is present.

const JALALI_DATE = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function isAnswerEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value as object).every(
      (v) => v === undefined || v === null || v === '',
    )
  ) {
    return true;
  }
  return false;
}

function decimalPlaces(value: number): number {
  const [, fraction = ''] = String(value).split('.');
  return fraction.length;
}

function validateNumber(
  value: unknown,
  settings: FormQuestion['settings'],
  bounds?: { min: number; max: number },
): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'پاسخ باید یک عدد معتبر باشد.';
  }
  const min = bounds?.min ?? settings?.minValue;
  const max = bounds?.max ?? settings?.maxValue;
  if (min !== null && min !== undefined && value < min) {
    return `پاسخ نباید کمتر از ${min} باشد.`;
  }
  if (max !== null && max !== undefined && value > max) {
    return `پاسخ نباید بیشتر از ${max} باشد.`;
  }
  const decimals = settings?.decimals;
  if (
    decimals !== null &&
    decimals !== undefined &&
    decimalPlaces(value) > decimals
  ) {
    return decimals === 0
      ? 'پاسخ باید عدد صحیح باشد.'
      : `پاسخ حداکثر ${decimals} رقم اعشار می‌تواند داشته باشد.`;
  }
  return null;
}

export function validateAnswer(
  question: FormQuestion,
  value: unknown,
): string | null {
  if (NON_ANSWERABLE_QUESTION_TYPES.includes(question.type)) return null;

  if (isAnswerEmpty(value)) {
    return question.required ? 'پاسخ به این سوال اجباری است.' : null;
  }

  const settings = question.settings;
  const optionTitles = (settings?.options ?? []).map((o) => o.title);

  switch (question.type) {
    case FormQuestionType.SHORT_TEXT:
    case FormQuestionType.LONG_TEXT:
      if (typeof value !== 'string') return 'پاسخ باید متنی باشد.';
      if (settings?.maxLength && value.length > settings.maxLength) {
        return `طول پاسخ نباید بیشتر از ${settings.maxLength} نویسه باشد.`;
      }
      return null;

    case FormQuestionType.BOOLEAN:
      return typeof value === 'boolean' ? null : 'پاسخ باید بله یا خیر باشد.';

    case FormQuestionType.NUMBER:
    case FormQuestionType.AMOUNT:
      return validateNumber(value, settings);

    case FormQuestionType.PERCENT:
      return validateNumber(value, settings, {
        min: Math.max(0, settings?.minValue ?? 0),
        max: Math.min(100, settings?.maxValue ?? 100),
      });

    case FormQuestionType.RATING: {
      const min = settings?.scaleMin ?? 1;
      const max = settings?.scaleMax ?? 5;
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < min ||
        value > max
      ) {
        return `امتیاز باید عددی صحیح بین ${min} تا ${max} باشد.`;
      }
      return null;
    }

    case FormQuestionType.SINGLE_CHOICE:
      return typeof value === 'string' && optionTitles.includes(value)
        ? null
        : 'گزینه انتخاب‌شده معتبر نیست.';

    case FormQuestionType.MULTI_CHOICE:
      if (
        !Array.isArray(value) ||
        value.some((v) => typeof v !== 'string' || !optionTitles.includes(v)) ||
        new Set(value).size !== value.length
      ) {
        return 'گزینه‌های انتخاب‌شده معتبر نیستند.';
      }
      return null;

    case FormQuestionType.DATE:
      return typeof value === 'string' && JALALI_DATE.test(value)
        ? null
        : 'تاریخ واردشده معتبر نیست.';

    case FormQuestionType.TIME:
      return typeof value === 'string' && TIME.test(value)
        ? null
        : 'ساعت واردشده معتبر نیست.';

    case FormQuestionType.DATETIME: {
      const v = value as { date?: unknown; time?: unknown };
      if (
        typeof v !== 'object' ||
        typeof v.date !== 'string' ||
        !JALALI_DATE.test(v.date) ||
        typeof v.time !== 'string' ||
        !TIME.test(v.time)
      ) {
        return 'تاریخ و ساعت باید هر دو به‌درستی وارد شوند.';
      }
      return null;
    }

    case FormQuestionType.FILE: {
      // Existence/ownership of each file id is checked by the caller against
      // the uploaded-file records of the same occurrence and question.
      if (
        !Array.isArray(value) ||
        value.some((f) => !f || typeof (f as any).id !== 'string')
      ) {
        return 'فایل‌های پیوست معتبر نیستند.';
      }
      const maxFiles = settings?.maxFiles ?? 1;
      if (value.length > maxFiles) {
        return `حداکثر ${maxFiles} فایل مجاز است.`;
      }
      return null;
    }

    default:
      return null;
  }
}
