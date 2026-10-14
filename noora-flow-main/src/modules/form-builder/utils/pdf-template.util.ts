import * as moment from 'moment-jalaali';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FormQuestion, FormQuestionType } from '../schemas/form-version.schema';

// Vazirmatn is embedded into the HTML (copied to dist by nest-cli assets) so
// PDF rendering never depends on reaching a font CDN from the server.
function fontFace(weight: 'normal' | 'bold', file: string): string {
  try {
    const data = readFileSync(join(__dirname, '..', 'fonts', file)).toString(
      'base64',
    );
    return `@font-face { font-family: 'Vazirmatn'; font-weight: ${weight};
      src: url(data:font/woff2;base64,${data}) format('woff2'); }`;
  } catch {
    return '';
  }
}

let fontFacesCache: string | null = null;
function fontFaces(): string {
  fontFacesCache ??=
    fontFace('normal', 'Vazirmatn-Regular.woff2') +
    fontFace('bold', 'Vazirmatn-Bold.woff2');
  return fontFacesCache;
}

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BASE_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: 'Vazirmatn', Tahoma, sans-serif;
    direction: rtl;
    text-align: right;
    padding: 24px;
    color: #111827;
    font-size: 13px;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: #4b5563; font-size: 12px; margin-bottom: 16px; }
  .meta span { margin-left: 16px; }
  .question { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; page-break-inside: avoid; }
  .question-title { font-weight: bold; margin-bottom: 4px; }
  .question-desc { color: #6b7280; font-size: 11px; margin-bottom: 6px; }
  .options { margin: 0; padding-right: 18px; }
  .answer-line { border-bottom: 1px solid #9ca3af; min-height: 20px; margin-top: 6px; }
  .answer-box { border: 1px solid #9ca3af; border-radius: 4px; min-height: 60px; margin-top: 6px; }
  .answer-value { font-weight: bold; margin-top: 4px; }
  .signature { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  .signature img { height: 60px; }
`;

function questionTypeLabel(type: FormQuestionType): string {
  const labels: Record<FormQuestionType, string> = {
    [FormQuestionType.SHORT_TEXT]: 'متن کوتاه',
    [FormQuestionType.LONG_TEXT]: 'متن بلند',
    [FormQuestionType.BOOLEAN]: 'بله / خیر',
    [FormQuestionType.NUMBER]: 'عددی',
    [FormQuestionType.PERCENT]: 'درصدی',
    [FormQuestionType.SINGLE_CHOICE]: 'تک‌گزینه‌ای',
    [FormQuestionType.MULTI_CHOICE]: 'چندگزینه‌ای',
    [FormQuestionType.DATE]: 'تاریخ',
    [FormQuestionType.TIME]: 'ساعت',
    [FormQuestionType.DATETIME]: 'تاریخ و ساعت',
    [FormQuestionType.AMOUNT]: 'مبلغ',
    [FormQuestionType.RATING]: 'امتیازدهی',
    [FormQuestionType.FILE]: 'فایل یا تصویر',
    [FormQuestionType.STATIC_TEXT]: 'متن ثابت',
  };
  return labels[type] ?? '';
}

function formatAnswerValue(question: any, value: unknown): string {
  if (value === undefined || value === null || value === '') return '-';
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    // File answers are stored as [{ id, name }]; the PDF lists the names.
    return value
      .map((v) => escapeHtml(v && typeof v === 'object' ? (v as any).name : v))
      .join('، ');
  }
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
  if (typeof value === 'object') {
    const v = value as any;
    return escapeHtml([v.date, v.time].filter(Boolean).join(' '));
  }
  return escapeHtml(value);
}

function renderQuestionBlock(
  question: any,
  answers?: Record<string, unknown>,
): string {
  const options: { title: string }[] = question.settings?.options ?? [];
  const isChoice =
    question.type === FormQuestionType.SINGLE_CHOICE ||
    question.type === FormQuestionType.MULTI_CHOICE;

  let body = '';
  if (question.type === FormQuestionType.STATIC_TEXT) {
    return `<div class="question"><div class="question-desc">${escapeHtml(
      question.description || question.title,
    )}</div></div>`;
  }

  if (isChoice) {
    body = `<ul class="options">${options
      .map((o) => `<li>${escapeHtml(o.title)}</li>`)
      .join('')}</ul>`;
  } else if (question.type === FormQuestionType.LONG_TEXT) {
    body = `<div class="answer-box"></div>`;
  } else {
    body = `<div class="answer-line"></div>`;
  }

  if (answers) {
    body = `<div class="answer-value">${formatAnswerValue(
      question,
      answers[question.id],
    )}</div>`;
  }

  return `
    <div class="question">
      <div class="question-title">${escapeHtml(question.title)}${
    question.required ? ' *' : ''
  } <span style="font-weight:normal;color:#6b7280;">(${questionTypeLabel(
    question.type,
  )})</span></div>
      ${
        question.description
          ? `<div class="question-desc">${escapeHtml(
              question.description,
            )}</div>`
          : ''
      }
      ${body}
    </div>
  `;
}

export function buildRawFormHtml(params: {
  title: string;
  code: string;
  category?: string;
  description?: string;
  versionNo: number;
  questions: FormQuestion[];
}): string {
  const { title, code, category, description, versionNo, questions } = params;
  return `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head><meta charset="utf-8" /><style>${fontFaces()}${BASE_STYLES}</style></head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        <span>کد فرم: ${escapeHtml(code)}</span>
        <span>دسته‌بندی: ${escapeHtml(category || '-')}</span>
        <span>نسخه: ${versionNo}</span>
      </div>
      ${description ? `<div class="meta">${escapeHtml(description)}</div>` : ''}
      ${[...questions]
        .sort((a: any, b: any) => a.order - b.order)
        .map((q) => renderQuestionBlock(q))
        .join('')}
    </body>
    </html>
  `;
}

export function buildCompletedFormHtml(params: {
  title: string;
  code: string;
  category?: string;
  versionNo: number;
  completerName: string;
  submittedAt: Date;
  periodKey?: string | null;
  questions: FormQuestion[];
  answers: Record<string, unknown>;
  signatureBase64?: string | null;
}): string {
  const {
    title,
    code,
    category,
    versionNo,
    completerName,
    submittedAt,
    periodKey,
    questions,
    answers,
    signatureBase64,
  } = params;

  return `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head><meta charset="utf-8" /><style>${fontFaces()}${BASE_STYLES}</style></head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        <span>کد فرم: ${escapeHtml(code)}</span>
        <span>دسته‌بندی: ${escapeHtml(category || '-')}</span>
        <span>نسخه: ${versionNo}</span>
        ${periodKey ? `<span>دوره: ${escapeHtml(periodKey)}</span>` : ''}
      </div>
      <div class="meta">
        <span>تکمیل‌کننده: ${escapeHtml(completerName)}</span>
        <span>تاریخ ثبت نهایی: ${escapeHtml(
          submittedAt ? moment(submittedAt).format('jYYYY/jMM/jDD HH:mm') : '-',
        )}</span>
        <span>وضعیت: ثبت نهایی و امضا شده</span>
      </div>
      ${[...questions]
        .sort((a: any, b: any) => a.order - b.order)
        .map((q) => renderQuestionBlock(q, answers))
        .join('')}
      <div class="signature">
        <div>امضای تکمیل‌کننده:</div>
        ${
          signatureBase64
            ? `<img src="data:image/png;base64,${signatureBase64}" />`
            : '<div>بدون امضا</div>'
        }
      </div>
    </body>
    </html>
  `;
}
