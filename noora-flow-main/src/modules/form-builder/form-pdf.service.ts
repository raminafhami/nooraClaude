import { Injectable } from '@nestjs/common';
import { generatePdfStream } from '../files/file.utils';
import { FormVersion } from './schemas/form-version.schema';
import {
  buildCompletedFormHtml,
  buildRawFormHtml,
} from './utils/pdf-template.util';

interface FormSummary {
  title: string;
  code: string;
  category?: string;
  description?: string | null;
}

// Pure HTML/PDF building, no DB access or auth - callers (FormService for
// the admin/raw path, FormResponseService for the employee/completed path)
// already own the ownership and permission checks for their own data.
@Injectable()
export class FormPdfService {
  async buildRawFormPdf(
    form: FormSummary,
    version: FormVersion,
  ): Promise<Buffer> {
    const html = buildRawFormHtml({
      title: form.title,
      code: form.code,
      category: form.category,
      description: form.description ?? undefined,
      versionNo: version.versionNo,
      questions: version.questions,
    });
    return generatePdfStream(html) as Promise<Buffer>;
  }

  async buildCompletedFormPdf(
    form: FormSummary,
    version: FormVersion,
    completion: {
      completerName: string;
      submittedAt: Date;
      periodKey?: string | null;
      answers: Record<string, unknown>;
      signatureBase64?: string | null;
    },
  ): Promise<Buffer> {
    const html = buildCompletedFormHtml({
      title: form.title,
      code: form.code,
      category: form.category,
      versionNo: version.versionNo,
      completerName: completion.completerName,
      submittedAt: completion.submittedAt,
      periodKey: completion.periodKey,
      questions: version.questions,
      answers: completion.answers,
      signatureBase64: completion.signatureBase64,
    });
    return generatePdfStream(html) as Promise<Buffer>;
  }
}
