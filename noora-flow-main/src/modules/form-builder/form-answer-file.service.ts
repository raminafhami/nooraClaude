import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientSession, isValidObjectId } from 'mongoose';
import * as fs from 'node:fs/promises';
import { extname } from 'path';
import { FormAnswerFileRepositoryImpl } from './repository/form-answer-file.repository';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormVersionRepositoryImpl } from './repository/form-version.repository';
import { FormShareRepositoryImpl } from './repository/form-share.repository';
import { FormResponseRepositoryImpl } from './repository/form-response.repository';
import { FormOccurrenceStatus } from './schemas/form-occurrence.schema';
import { FormQuestionType } from './schemas/form-version.schema';
import { FormAnswerFileDocument } from './schemas/form-answer-file.schema';

const DEFAULT_MAX_FILE_SIZE_MB = 10;
const DEFAULT_MAX_FILES = 1;

@Injectable()
export class FormAnswerFileService {
  constructor(
    private readonly formAnswerFileRepositoryImpl: FormAnswerFileRepositoryImpl,
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
    private readonly formVersionRepositoryImpl: FormVersionRepositoryImpl,
    private readonly formShareRepositoryImpl: FormShareRepositoryImpl,
    private readonly formResponseRepositoryImpl: FormResponseRepositoryImpl,
  ) {}

  private async getOwnedOpenOccurrence(occurrenceId: string, userId: string) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence || occurrence.userId.toString() !== userId) {
      throw new NotFoundException('نوبت مورد نظر یافت نشد.');
    }
    if (occurrence.status === FormOccurrenceStatus.COMPLETED) {
      throw new BadRequestException(
        'این نوبت قبلاً ثبت نهایی شده و قابل ویرایش نیست.',
      );
    }
    return occurrence;
  }

  async upload(
    occurrenceId: string,
    userId: string,
    questionId: string,
    file: any,
    session?: ClientSession,
  ) {
    if (!file) {
      throw new BadRequestException('فایلی ارسال نشده است.');
    }
    try {
      const occurrence = await this.getOwnedOpenOccurrence(
        occurrenceId,
        userId,
      );
      const version = await this.formVersionRepositoryImpl.findById(
        occurrence.versionId,
      );
      const question = version?.questions.find(
        (q: any) => q.id === questionId,
      );
      if (!question || question.type !== FormQuestionType.FILE) {
        throw new BadRequestException('این سوال از نوع فایل نیست.');
      }

      const settings = question.settings ?? ({} as any);
      const maxMb = settings.maxFileSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        throw new BadRequestException(
          `حجم فایل نباید بیشتر از ${maxMb} مگابایت باشد.`,
        );
      }

      const allowedTypes: string[] = (settings.allowedFileTypes ?? []).map(
        (t: string) => t.toLowerCase().replace(/^\./, ''),
      );
      const ext = extname(file.originalname).toLowerCase().replace('.', '');
      if (allowedTypes.length && !allowedTypes.includes(ext)) {
        throw new BadRequestException(
          `نوع فایل مجاز نیست. انواع مجاز: ${allowedTypes.join('، ')}`,
        );
      }

      const maxFiles = settings.maxFiles ?? DEFAULT_MAX_FILES;
      const existing = await this.formAnswerFileRepositoryImpl.count({
        occurrenceId: occurrence.id,
        questionId,
      });
      if (existing >= maxFiles) {
        throw new BadRequestException(
          `حداکثر ${maxFiles} فایل برای این سوال مجاز است.`,
        );
      }

      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
      const [created] = await this.formAnswerFileRepositoryImpl.create(
        {
          occurrenceId: occurrence.id,
          userId,
          questionId,
          originalName,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          directory: file.destination,
        },
        session,
      );
      return {
        id: created.id,
        name: originalName,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (err) {
      await fs.unlink(file.path).catch(() => undefined);
      throw err;
    }
  }

  async remove(occurrenceId: string, fileId: string, userId: string) {
    const occurrence = await this.getOwnedOpenOccurrence(occurrenceId, userId);
    const file = await this.formAnswerFileRepositoryImpl.findOne({
      _id: fileId,
      occurrenceId: occurrence.id,
    });
    if (!file) {
      throw new NotFoundException('فایل مورد نظر یافت نشد.');
    }
    await this.formAnswerFileRepositoryImpl.deleteById(file.id);
    await fs.unlink(file.path).catch(() => undefined);
  }

  // Every id in a FILE answer must be a file uploaded to this same
  // occurrence and question (finalize-time check; no foreign file ids).
  async assertFilesBelong(
    occurrenceId: string,
    questionId: string,
    value: { id: string }[],
  ) {
    const ids = value.map((f) => f.id);
    if (ids.some((id) => !isValidObjectId(id))) {
      throw new BadRequestException('فایل‌های پیوست معتبر نیستند.');
    }
    const found = await this.formAnswerFileRepositoryImpl.count({
      _id: { $in: ids },
      occurrenceId,
      questionId,
    });
    if (found !== new Set(ids).size) {
      throw new BadRequestException(
        'برخی از فایل‌های پیوست یافت نشدند؛ لطفاً دوباره بارگذاری کنید.',
      );
    }
  }

  private async getFileOfOccurrence(
    occurrenceId: string,
    fileId: string,
  ): Promise<FormAnswerFileDocument> {
    if (!isValidObjectId(fileId) || !isValidObjectId(occurrenceId)) {
      throw new NotFoundException('فایل مورد نظر یافت نشد.');
    }
    const file = await this.formAnswerFileRepositoryImpl.findOne({
      _id: fileId,
      occurrenceId,
    });
    if (!file) {
      throw new NotFoundException('فایل مورد نظر یافت نشد.');
    }
    return file;
  }

  async getForOwner(occurrenceId: string, fileId: string, userId: string) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence || occurrence.userId.toString() !== userId) {
      throw new NotFoundException('فایل مورد نظر یافت نشد.');
    }
    return this.getFileOfOccurrence(occurrence.id, fileId);
  }

  // Caller is permission-checked (Subjects.FORM_BUILDER) at the controller.
  async getForAdmin(occurrenceId: string, fileId: string) {
    return this.getFileOfOccurrence(occurrenceId, fileId);
  }

  async getForShare(shareId: string, fileId: string, userId: string) {
    const share = await this.formShareRepositoryImpl.findById(shareId);
    if (!share) {
      throw new NotFoundException('رکورد ارسالی یافت نشد.');
    }
    if (
      share.sharedWith.toString() !== userId &&
      share.sharedBy.toString() !== userId
    ) {
      throw new ForbiddenException('شما به این رکورد دسترسی ندارید.');
    }
    const response = await this.formResponseRepositoryImpl.findById(
      share.responseId,
    );
    if (!response) {
      throw new NotFoundException('پاسخ مربوط به این ارسال یافت نشد.');
    }
    return this.getFileOfOccurrence(response.occurrenceId.toString(), fileId);
  }
}
