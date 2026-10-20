import * as moment from 'moment-jalaali';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FormQuestion, FormQuestionType } from '../schemas/form-version.schema';

// Organization form layout (APK template, A4): double brown frame on every
// page, header with logo | title | Code/Rev separated by vertical rules, and
// grey rounded rows (bold label on the right, value on the left). All
// measurements are in pt and mirror the reference template PDF.

const BRAND = '#9e8166';
const NAVY = '#132134';

// Fonts and logo are embedded (copied to dist by nest-cli assets) so PDF
// rendering never depends on reaching a CDN from the server.
function readAsset(dir: string, file: string): string | null {
  try {
    return readFileSync(join(__dirname, '..', dir, file)).toString('base64');
  } catch {
    return null;
  }
}

let assetCache: { css: string; logo: string | null } | null = null;
function assets() {
  if (!assetCache) {
    const face = (weight: string, file: string) => {
      const data = readAsset('fonts', file);
      return data
        ? `@font-face { font-family: 'Vazirmatn'; font-weight: ${weight};
            src: url(data:font/woff2;base64,${data}) format('woff2'); }`
        : '';
    };
    assetCache = {
      css:
        face('normal', 'Vazirmatn-Regular.woff2') +
        face('bold', 'Vazirmatn-Bold.woff2'),
      logo: readAsset('brand', 'apk-form-logo.png'),
    };
  }
  return assetCache;
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

// Direction-isolated value (times, dates, numbers, codes keep LTR order
// inside RTL text).
const ltr = (value: unknown) => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`;

const STYLES = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Vazirmatn', Tahoma, sans-serif;
    direction: rtl;
    color: #000;
    font-size: 9.4pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .frame { position: fixed; border: 1pt solid ${BRAND}; pointer-events: none; }
  .frame.a { left: 22.6pt; top: 9.7pt; right: 22.5pt; bottom: 9.7pt; }
  .frame.b { left: 11.3pt; top: 19.5pt; right: 11.3pt; bottom: 19.4pt; }

  table.page { width: 100%; border-collapse: collapse; }
  table.page > thead > tr > td { padding: 58pt 64.2pt 0 62.4pt; }
  table.page > tfoot > tr > td { height: 34pt; }
  table.page > tbody > tr > td { padding: 0 64.2pt 0 62.4pt; vertical-align: top; }

  .header { display: flex; align-items: center; height: 58pt; margin-bottom: 48pt; }
  .header .logo { width: 154pt; display: flex; justify-content: flex-start; }
  .header .logo img { height: 55pt; }
  .header .rule { width: 0; height: 32.5pt; border-right: 1pt solid ${BRAND}; }
  .header .title { width: 161pt; text-align: center; font-weight: bold; font-size: 12pt; line-height: 1.35; padding: 0 8pt; }
  .header .code { flex: 1; direction: ltr; text-align: left; font-weight: bold; font-size: 12pt; line-height: 1.35; }

  .desc { color: #6b6b6b; font-size: 8.5pt; margin: -36pt 0 18pt; }

  .row {
    background: #f2f2f2; border-radius: 3pt; min-height: 26.4pt;
    padding: 6pt 12.8pt; margin-bottom: 8.7pt;
    display: flex; align-items: center; gap: 12pt;
    page-break-inside: avoid; break-inside: avoid;
  }
  .row.stack { flex-direction: column; align-items: stretch; gap: 5pt; }
  .label { font-weight: bold; flex: 0 0 38%; line-height: 1.5; }
  .row.stack .label { flex: none; }
  .label .req { color: ${BRAND}; }
  .label .num { color: #8a8a8a; margin-left: 3pt; }
  .label .hint { display: block; font-weight: normal; color: #8a8a8a; font-size: 8pt; }
  .value { flex: 1; color: #4b4b4b; font-weight: bold; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .value.empty { color: #8a8a8a; font-weight: normal; }

  .note { color: #6b6b6b; font-size: 8.8pt; padding: 2pt 12.8pt 10pt; line-height: 1.7; break-inside: avoid; }

  .blank { flex: 1; display: flex; align-items: center; gap: 6pt; color: #9a9a9a; font-size: 8.5pt; }
  .field { background: #fff; border: 0.75pt solid #d6d6d6; border-radius: 3pt; height: 17pt; flex: 1; }
  .field.area { height: 64pt; flex: none; width: 100%; }
  .field.short { flex: 0 0 70pt; }
  .opts { flex: 1; display: flex; flex-wrap: wrap; gap: 5pt 14pt; color: #000; font-weight: normal; }
  .opt { display: inline-flex; align-items: center; gap: 4pt; }
  .box { display: inline-block; width: 8.5pt; height: 8.5pt; border: 0.9pt solid #6b6b6b; border-radius: 1.5pt; background: #fff; }
  .box.round { border-radius: 50%; }

  .meta { display: grid; grid-template-columns: 1fr 1fr; column-gap: 8.7pt; }
  .meta .row .label { flex-basis: 45%; }

  .signature { margin-top: 10pt; display: flex; justify-content: flex-start; break-inside: avoid; page-break-inside: avoid; }
  .signature .card { width: 250pt; border: 0.9pt solid ${BRAND}; border-radius: 4pt; padding: 6pt 10pt; display: flex; align-items: center; gap: 10pt; }
  .signature .who { flex: 1; }
  .signature .caption { font-weight: bold; }
  .signature .name { color: #4b4b4b; margin-top: 3pt; }
  .signature .sig { flex: 0 0 120pt; height: 50pt; display: flex; align-items: center; justify-content: center; }
  .signature img { max-height: 50pt; max-width: 120pt; }
`;

function questionLabel(question: any, index: number): string {
  return `<div class="label"><span class="num">${index}.</span>${escapeHtml(
    question.title,
  )}${question.required ? ' <span class="req">*</span>' : ''}${
    question.description
      ? `<span class="hint">${escapeHtml(question.description)}</span>`
      : ''
  }</div>`;
}

// ---- blank (raw) answer areas -------------------------------------------
function blankArea(question: any): string {
  const s = question.settings ?? {};
  const options: { title: string }[] = [...(s.options ?? [])].sort(
    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
  );
  switch (question.type) {
    case FormQuestionType.SINGLE_CHOICE:
    case FormQuestionType.MULTI_CHOICE: {
      const round = question.type === FormQuestionType.SINGLE_CHOICE;
      return `<div class="opts">${options
        .map(
          (o) =>
            `<span class="opt"><span class="box${
              round ? ' round' : ''
            }"></span>${escapeHtml(o.title)}</span>`,
        )
        .join('')}</div>`;
    }
    case FormQuestionType.BOOLEAN:
      return `<div class="opts"><span class="opt"><span class="box round"></span>بله</span><span class="opt"><span class="box round"></span>خیر</span></div>`;
    case FormQuestionType.RATING: {
      const min = s.scaleMin ?? 1;
      const max = s.scaleMax ?? 5;
      const items = [];
      for (let i = min; i <= max; i++) {
        items.push(
          `<span class="opt"><span class="box round"></span>${ltr(i)}</span>`,
        );
      }
      return `<div class="opts">${items.join('')}</div>`;
    }
    case FormQuestionType.DATE:
      return `<div class="blank">${ltr('____ / ____ / ________')}</div>`;
    case FormQuestionType.TIME:
      return `<div class="blank">${ltr('____ : ____')}</div>`;
    case FormQuestionType.DATETIME:
      return `<div class="blank">تاریخ ${ltr(
        '____ / ____ / ________',
      )} &nbsp; ساعت ${ltr('____ : ____')}</div>`;
    case FormQuestionType.PERCENT:
      return `<div class="blank"><span class="field short"></span>٪</div>`;
    case FormQuestionType.AMOUNT:
      return `<div class="blank"><span class="field"></span>${escapeHtml(
        s.currency || '',
      )}</div>`;
    case FormQuestionType.FILE:
      return `<div class="blank"><span class="field"></span>پیوست</div>`;
    case FormQuestionType.LONG_TEXT:
      return `<span class="field area"></span>`;
    default:
      return `<div class="blank"><span class="field"></span></div>`;
  }
}

// ---- completed answer values --------------------------------------------
function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

function answerValue(question: any, value: unknown): string {
  const empty = '<div class="value empty">-</div>';
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return empty;
  }
  const s = question.settings ?? {};
  let html: string;
  switch (question.type) {
    case FormQuestionType.BOOLEAN:
      html = value === true ? 'بله' : value === false ? 'خیر' : escapeHtml(value);
      break;
    case FormQuestionType.NUMBER:
      html = typeof value === 'number' ? ltr(formatNumber(value)) : ltr(value);
      break;
    case FormQuestionType.PERCENT:
      html = `${ltr(typeof value === 'number' ? formatNumber(value) : value)}٪`;
      break;
    case FormQuestionType.AMOUNT:
      html = `${ltr(typeof value === 'number' ? formatNumber(value) : value)}${
        s.currency ? ` ${escapeHtml(s.currency)}` : ''
      }`;
      break;
    case FormQuestionType.RATING:
      html = `${ltr(value)} از ${ltr(s.scaleMax ?? 5)}`;
      break;
    case FormQuestionType.DATE:
    case FormQuestionType.TIME:
      html = ltr(value);
      break;
    case FormQuestionType.DATETIME: {
      const v = value as { date?: string; time?: string };
      html = [v?.date ? ltr(v.date) : '', v?.time ? `ساعت ${ltr(v.time)}` : '']
        .filter(Boolean)
        .join(' &nbsp; ');
      break;
    }
    case FormQuestionType.MULTI_CHOICE:
      html = (Array.isArray(value) ? value : [value]).map(escapeHtml).join('، ');
      break;
    case FormQuestionType.FILE:
      html = (Array.isArray(value) ? value : [value])
        .map((f: any) => ltr(f && typeof f === 'object' ? f.name : f))
        .join('، ');
      break;
    default:
      html = escapeHtml(value);
  }
  return `<div class="value">${html || '-'}</div>`;
}

function questionRows(
  questions: FormQuestion[],
  answers?: Record<string, unknown>,
): string {
  let index = 0;
  return [...questions]
    .sort((a: any, b: any) => a.order - b.order)
    .map((q: any) => {
      if (q.type === FormQuestionType.STATIC_TEXT) {
        return `<div class="note">${escapeHtml(q.description || q.title)}</div>`;
      }
      index += 1;
      const stack =
        q.type === FormQuestionType.LONG_TEXT ||
        (!answers &&
          (q.type === FormQuestionType.MULTI_CHOICE ||
            q.type === FormQuestionType.SINGLE_CHOICE) &&
          (q.settings?.options?.length ?? 0) > 3);
      const body = answers ? answerValue(q, answers[q.id]) : blankArea(q);
      return `<div class="row${stack ? ' stack' : ''}">${questionLabel(
        q,
        index,
      )}${body}</div>`;
    })
    .join('');
}

// Revision is zero-based like the template (first issue = Rev:00).
function revision(versionNo: number): string {
  return String(Math.max(0, (versionNo ?? 1) - 1)).padStart(2, '0');
}

function documentHtml(params: {
  title: string;
  code: string;
  versionNo: number;
  description?: string;
  body: string;
}): string {
  const { css, logo } = assets();
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="utf-8" /><style>${css}${STYLES}</style></head>
<body>
  <div class="frame a"></div><div class="frame b"></div>
  <table class="page">
    <thead><tr><td>
      <div class="header">
        <div class="logo">${
          logo ? `<img src="data:image/png;base64,${logo}" alt="APK" />` : ''
        }</div>
        <div class="rule"></div>
        <div class="title">${escapeHtml(params.title)}</div>
        <div class="rule"></div>
        <div class="code">Code:${escapeHtml(params.code)}<br />Rev:${revision(
          params.versionNo,
        )}</div>
      </div>
    </td></tr></thead>
    <tfoot><tr><td></td></tr></tfoot>
    <tbody><tr><td>
      ${
        params.description
          ? `<div class="desc">${escapeHtml(params.description)}</div>`
          : ''
      }
      ${params.body}
    </td></tr></tbody>
  </table>
</body>
</html>`;
}

export function buildRawFormHtml(params: {
  title: string;
  code: string;
  category?: string;
  description?: string;
  versionNo: number;
  questions: FormQuestion[];
}): string {
  return documentHtml({
    title: params.title,
    code: params.code,
    versionNo: params.versionNo,
    description: params.description,
    body: questionRows(params.questions),
  });
}

export function buildCompletedFormHtml(params: {
  title: string;
  code: string;
  category?: string;
  description?: string;
  versionNo: number;
  completerName: string;
  submittedAt: Date;
  periodKey?: string | null;
  questions: FormQuestion[];
  answers: Record<string, unknown>;
  signatureBase64?: string | null;
}): string {
  const submitted = params.submittedAt
    ? moment(params.submittedAt)
        .utcOffset(210)
        .format('jYYYY/jMM/jDD - HH:mm')
    : '-';
  const period =
    params.periodKey && params.periodKey !== 'once' ? params.periodKey : null;
  const metaRow = (label: string, value: string) =>
    `<div class="row"><div class="label">${label}</div><div class="value">${value}</div></div>`;

  const meta = `<div class="meta">
    ${metaRow('تکمیل‌کننده', escapeHtml(params.completerName || '-'))}
    ${metaRow('تاریخ ثبت نهایی', ltr(submitted))}
    ${period ? metaRow('دوره', ltr(period)) : ''}
    ${metaRow('وضعیت', 'ثبت نهایی و امضا شده')}
  </div>`;

  const signature = `<div class="signature"><div class="card">
    <div class="who">
      <div class="caption">امضای تکمیل‌کننده</div>
      <div class="name">${escapeHtml(params.completerName || '')}</div>
    </div>
    <div class="sig">${
      params.signatureBase64
        ? `<img src="data:image/png;base64,${params.signatureBase64}" alt="امضا" />`
        : '<span class="value empty">بدون امضا</span>'
    }</div>
  </div></div>`;

  return documentHtml({
    title: params.title,
    code: params.code,
    versionNo: params.versionNo,
    body: meta + questionRows(params.questions, params.answers) + signature,
  });
}
