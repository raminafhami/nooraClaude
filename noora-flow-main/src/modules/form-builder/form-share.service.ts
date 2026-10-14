import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { FormShareRepositoryImpl } from './repository/form-share.repository';
import { FormResponseRepositoryImpl } from './repository/form-response.repository';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormVersionRepositoryImpl } from './repository/form-version.repository';
import { FormRepositoryImpl } from './repository/form.repository';
import { FormResponseStatus } from './schemas/form-response.schema';
import { CreateFormShareDto } from './dto/create-form-share.dto';
import { FormPdfService } from './form-pdf.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority } from '../notifications/enums';

@Injectable()
export class FormShareService {
  constructor(
    private readonly formShareRepositoryImpl: FormShareRepositoryImpl,
    private readonly formResponseRepositoryImpl: FormResponseRepositoryImpl,
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
    private readonly formVersionRepositoryImpl: FormVersionRepositoryImpl,
    private readonly formRepositoryImpl: FormRepositoryImpl,
    private readonly formPdfService: FormPdfService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Sharing only ever works off a response the sender owns and has already
  // finalized - a draft or someone else's record can never be forwarded
  // (spec 18: "ارسال‌کننده" must be the real completer, and the shared
  // record is always the already-signed original).
  async shareResponse(
    occurrenceId: string,
    senderUserId: string,
    dto: CreateFormShareDto,
    session?: ClientSession,
  ) {
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      occurrenceId,
    );
    if (!occurrence || occurrence.userId.toString() !== senderUserId) {
      throw new NotFoundException('نوبت مورد نظر یافت نشد.');
    }
    const response = await this.formResponseRepositoryImpl.findOne({
      occurrenceId: occurrence.id,
    });
    if (!response || response.status !== FormResponseStatus.COMPLETED) {
      throw new BadRequestException(
        'فقط فرم‌های ثبت‌نهایی‌شده قابل ارسال برای دیگران هستند.',
      );
    }
    if (dto.recipientUserId === senderUserId) {
      throw new BadRequestException('ارسال فرم برای خودتان امکان‌پذیر نیست.');
    }

    const [share] = await this.formShareRepositoryImpl.create(
      {
        responseId: response.id,
        sharedBy: senderUserId,
        sharedWith: dto.recipientUserId,
        message: dto.message ?? null,
      },
      session,
    );

    try {
      const form = await this.formRepositoryImpl.findById(occurrence.formId);
      const notification = await this.notificationsService.create({
        title: 'فرم جدید برای شما ارسال شد',
        description: `یک رکورد تکمیل‌شده از فرم ${
          form?.title ?? ''
        } برای شما ارسال شد.`,
        category: 'form-builder',
        priority: NotificationPriority.LOW,
        recipient: { users: [dto.recipientUserId], groups: [] },
        link: `/dashboard/profile/received-forms/${share.id}`,
        isPublished: true,
        createdBy: senderUserId,
      });
      await this.notificationsService.sendNotification(notification);
    } catch (err) {
      // Sharing itself already succeeded; a notification failure shouldn't
      // fail the whole request or be retried as a duplicate share.
      console.error('[form-builder] failed notifying share recipient', err);
    }

    return this.formShareRepositoryImpl.findById(share.id, undefined, session);
  }

  async listReceivedShares(userId: string) {
    return this.formShareRepositoryImpl.find(
      { sharedWith: userId },
      null,
      null,
      null,
      { createdAt: -1 },
      'sender',
    );
  }

  private async getAccessibleShareOrFail(shareId: string, userId: string) {
    const share = await this.formShareRepositoryImpl.findById(
      shareId,
      'sender recipient',
    );
    if (!share) {
      throw new NotFoundException('رکورد ارسالی یافت نشد.');
    }
    if (
      share.sharedWith.toString() !== userId &&
      share.sharedBy.toString() !== userId
    ) {
      throw new ForbiddenException('شما به این رکورد دسترسی ندارید.');
    }
    return share;
  }

  async getShareDetail(shareId: string, userId: string) {
    const share = await this.getAccessibleShareOrFail(shareId, userId);
    const response = await this.formResponseRepositoryImpl.findById(
      share.responseId,
    );
    if (!response) {
      throw new NotFoundException('پاسخ مربوط به این ارسال یافت نشد.');
    }
    const version = await this.formVersionRepositoryImpl.findById(
      response.versionId,
    );
    const form = await this.formRepositoryImpl.findById(
      response.formId,
      'category',
    );
    return { share, response, version, form };
  }

  async generateSharedCompletedPdf(shareId: string, userId: string) {
    const { response, version, form } = await this.getShareDetail(
      shareId,
      userId,
    );
    if (!version || !form) {
      throw new NotFoundException('اطلاعات فرم یافت نشد.');
    }
    const occurrence = await this.formOccurrenceRepositoryImpl.findById(
      response.occurrenceId,
    );
    const buffer = await this.formPdfService.buildCompletedFormPdf(
      {
        title: form.title,
        code: form.code,
        category: (form as any).category?.title,
      },
      version,
      {
        completerName: response.completerName,
        submittedAt: response.submittedAt,
        periodKey: occurrence?.periodKey,
        answers: response.answers as Record<string, unknown>,
        signatureBase64: response.signatureBase64,
      },
    );
    return { buffer, filename: `${form.code}-shared.pdf` };
  }
}
