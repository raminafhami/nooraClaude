import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { FormResponseRepositoryImpl } from './repository/form-response.repository';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormVersionRepositoryImpl } from './repository/form-version.repository';
import { FormRepositoryImpl } from './repository/form.repository';
import { FormResponseStatus } from './schemas/form-response.schema';
import { FormOccurrenceStatus } from './schemas/form-occurrence.schema';
import {
  FormQuestion,
  NON_ANSWERABLE_QUESTION_TYPES,
} from './schemas/form-version.schema';
import { SaveResponseAnswersDto } from './dto/save-response-answers.dto';
import { UserFilesService } from '../user-files/user-files.service';
import { FormPdfService } from './form-pdf.service';

@Injectable()
export class FormResponseService {
  constructor(
    private readonly formResponseRepositoryImpl: FormResponseRepositoryImpl,
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
    private readonly formVersionRepositoryImpl: FormVersionRepositoryImpl,
    private readonly formRepositoryImpl: FormRepositoryImpl,
    private readonly userFilesService: UserFilesService,
    private readonly formPdfService: FormPdfService,
  ) {}

  private async getOwnedOccurrenceOrFail(occurrenceId: string, userId: string) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence) {
      throw new NotFoundException('نوبت مورد نظر یافت نشد.');
    }
    if (occurrence.userId.toString() !== userId) {
      throw new ForbiddenException('شما به این نوبت دسترسی ندارید.');
    }
    return occurrence;
  }

  async getResponse(occurrenceId: string, userId: string) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );
    const response = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });
    return response;
  }

  async getOccurrenceVersion(occurrenceId: string, userId: string) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );
    const version = await this.formVersionRepositoryImpl.findById(
      occurrence.versionId,
    );
    if (!version) {
      throw new NotFoundException('نسخه فرم یافت نشد.');
    }
    // Minimal, permission-free form summary: the employee can read their
    // own occurrence/version regardless of Subjects.FORM_BUILDER (an
    // admin-only subject), so this avoids reusing the admin form endpoint.
    const form = await this.formRepositoryImpl.findById(
      occurrence.formId,
      'category',
    );
    return {
      occurrence,
      version,
      form: form
        ? {
            id: form.id,
            title: form.title,
            code: form.code,
            category: (form as any).category,
          }
        : null,
    };
  }

  async saveAnswers(
    occurrenceId: string,
    userId: string,
    dto: SaveResponseAnswersDto,
    session?: ClientSession,
  ) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );
    if (occurrence.status === FormOccurrenceStatus.COMPLETED) {
      throw new BadRequestException(
        'این نوبت قبلاً ثبت نهایی شده و قابل ویرایش نیست.',
      );
    }

    const existing = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });

    if (existing) {
      if (dto.revision !== existing.revision) {
        throw new ConflictException(
          'نسخه پاسخ شما قدیمی است؛ لطفاً صفحه را بازخوانی کنید.',
        );
      }
      await this.formResponseRepositoryImpl.updateById(
        existing.id,
        {
          answers: dto.answers,
          revision: existing.revision + 1,
          lastSavedAt: new Date(),
        },
        session,
      );
      return this.formResponseRepositoryImpl.findById(
        existing.id,
        undefined,
        session,
      );
    }

    if (dto.revision !== 0) {
      throw new ConflictException(
        'نسخه پاسخ شما قدیمی است؛ لطفاً صفحه را بازخوانی کنید.',
      );
    }

    const [created] = await this.formResponseRepositoryImpl.create(
      {
        occurrenceId: occurrence.id,
        formId: occurrence.formId,
        userId,
        versionId: occurrence.versionId,
        answers: dto.answers,
        status: FormResponseStatus.DRAFT,
        revision: 1,
        lastSavedAt: new Date(),
      },
      session,
    );

    if (occurrence.status === FormOccurrenceStatus.PENDING) {
      await this.formOccurrenceRepositoryImpl.updateById(
        occurrence.id,
        {
          status: FormOccurrenceStatus.IN_PROGRESS,
          responseId: created.id,
        },
        session,
      );
    }

    return created;
  }

  private isAnswerMissing(question: FormQuestion, value: unknown): boolean {
    if (NON_ANSWERABLE_QUESTION_TYPES.includes(question.type)) {
      return false;
    }
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  // Final submission is one atomic operation (spec 13/14): validate required
  // answers, pull the employee's own on-file signature as an immutable
  // snapshot, and flip both the response and its occurrence to COMPLETED.
  // All writes share the per-request Mongo transaction (TransactionInterceptor),
  // so a signature failure can never leave a response half-finalized - and a
  // repeat request on an already-completed occurrence is a no-op, never a
  // second signature.
  async finalizeResponse(
    occurrenceId: string,
    userId: string,
    completerFullName: string,
    session?: ClientSession,
  ) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );

    if (occurrence.status === FormOccurrenceStatus.COMPLETED) {
      return this.formResponseRepositoryImpl.findOne({
        occurrenceId: occurrence.id,
      });
    }

    const response = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });
    if (!response) {
      throw new BadRequestException(
        'قبل از ثبت نهایی باید حداقل یک‌بار پاسخ‌ها ذخیره شوند.',
      );
    }

    const version = await this.formVersionRepositoryImpl.findById(
      occurrence.versionId,
    );
    if (!version) {
      throw new NotFoundException('نسخه فرم یافت نشد.');
    }

    const hasMissingRequiredAnswer = version.questions.some(
      (question: any) =>
        question.required &&
        this.isAnswerMissing(
          question,
          (response.answers as Record<string, unknown>)[question.id],
        ),
    );
    if (hasMissingRequiredAnswer) {
      throw new BadRequestException('لطفاً به تمام سوالات اجباری پاسخ دهید.');
    }

    const signatureBase64 = await this.userFilesService.getUserSignature(
      userId,
    );
    if (!signatureBase64) {
      throw new BadRequestException(
        'امضای معتبری برای شما در مدارک پرسنلی ثبت نشده است. لطفاً ابتدا امضای خود را در بخش مدارک پروفایل ثبت کنید.',
      );
    }

    await this.formResponseRepositoryImpl.updateById(
      response.id,
      {
        status: FormResponseStatus.COMPLETED,
        submittedAt: new Date(),
        completerName: completerFullName,
        signatureBase64,
        signedAt: new Date(),
      },
      session,
    );

    await this.formOccurrenceRepositoryImpl.updateById(
      occurrence.id,
      { status: FormOccurrenceStatus.COMPLETED },
      session,
    );

    return this.formResponseRepositoryImpl.findById(
      response.id,
      undefined,
      session,
    );
  }

  private async getFormSummary(formId: string) {
    const form = await this.formRepositoryImpl.findById(formId, 'category');
    return {
      title: form?.title ?? '',
      code: form?.code ?? '',
      category: (form as any)?.category?.title,
    };
  }

  async generateRawFormPdf(occurrenceId: string, userId: string) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );
    const version = await this.formVersionRepositoryImpl.findById(
      occurrence.versionId,
    );
    if (!version) {
      throw new NotFoundException('نسخه فرم یافت نشد.');
    }
    const form = await this.getFormSummary(occurrence.formId);
    const buffer = await this.formPdfService.buildRawFormPdf(form, version);
    return { buffer, filename: `${form.code}.pdf` };
  }

  async generateCompletedFormPdf(occurrenceId: string, userId: string) {
    const occurrence = await this.getOwnedOccurrenceOrFail(
      occurrenceId,
      userId,
    );
    return this.buildCompletedPdfForOccurrence(occurrence.id);
  }

  // Shared by the employee's own download (ownership-checked above) and the
  // QA manager's report view (permission-checked by Subjects.FORM_BUILDER at
  // the controller instead of occurrence ownership - a manager legitimately
  // needs to open records that aren't their own).
  async buildCompletedPdfForOccurrence(occurrenceId: string) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence) {
      throw new NotFoundException('نوبت مورد نظر یافت نشد.');
    }
    if (occurrence.status !== FormOccurrenceStatus.COMPLETED) {
      throw new BadRequestException('این نوبت هنوز ثبت نهایی نشده است.');
    }
    const response = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });
    if (!response) {
      throw new NotFoundException('پاسخ ثبت‌شده یافت نشد.');
    }
    const version = await this.formVersionRepositoryImpl.findById(
      occurrence.versionId,
    );
    if (!version) {
      throw new NotFoundException('نسخه فرم یافت نشد.');
    }
    const form = await this.getFormSummary(occurrence.formId);

    const buffer = await this.formPdfService.buildCompletedFormPdf(
      form,
      version,
      {
        completerName: response.completerName,
        submittedAt: response.submittedAt,
        periodKey: occurrence.periodKey,
        answers: response.answers as Record<string, unknown>,
        signatureBase64: response.signatureBase64,
      },
    );
    return {
      buffer,
      filename: `${form.code}-${occurrence.periodKey ?? occurrence.id}.pdf`,
    };
  }

  async getOccurrenceDetailAsAdmin(occurrenceId: string) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence) {
      throw new NotFoundException('نوبت مورد نظر یافت نشد.');
    }
    const response = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });
    const version = await this.formVersionRepositoryImpl.findById(
      occurrence.versionId,
    );
    return { occurrence, response, version };
  }
}
