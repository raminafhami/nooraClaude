import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { CrudService } from 'src/shared/crud/service/crud.service';
import {
  FormAssignmentDocument,
  FormAssignmentFrequency,
  RECURRING_FREQUENCIES,
} from './schemas/form-assignment.schema';
import { FormStatus } from './schemas/form.schema';
import { FormOccurrenceStatus } from './schemas/form-occurrence.schema';
import { FormAssignmentRepositoryImpl } from './repository/form-assignment.repository';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormRepositoryImpl } from './repository/form.repository';
import { CreateFormAssignmentDto } from './dto/create-form-assignment.dto';
import { resolvePeriod, ResolvedPeriod } from './utils/period.util';

export interface AssignmentResult {
  userId: string;
  success: boolean;
  assignmentId?: string;
  message?: string;
}

@Injectable()
export class FormAssignmentService
  extends CrudService<FormAssignmentDocument>
  implements OnModuleInit
{
  constructor(
    private readonly formAssignmentRepositoryImpl: FormAssignmentRepositoryImpl,
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
    private readonly formRepositoryImpl: FormRepositoryImpl,
    private readonly cronJobService: CronJobService,
  ) {
    super(formAssignmentRepositoryImpl);
  }

  onModuleInit() {
    // Daily sweep: rolls every active recurring assignment forward into its
    // current calendar period, and self-heals any period missed by a prior
    // outage (it only checks "does today's period exist yet", not deltas).
    this.cronJobService.startJob(
      '30 0 * * *',
      () => this.generateDueOccurrencesForAllActiveAssignments(),
      'Asia/Tehran',
      'formBuilderGenerateOccurrences',
    );
  }

  private async upsertOccurrence(
    assignment: FormAssignmentDocument,
    versionId: string,
    period:
      | ResolvedPeriod
      | {
          periodKey: string;
          periodStart: null;
          periodEnd: null;
          dueDate: Date | null;
        },
    session?: ClientSession,
  ) {
    return this.formOccurrenceRepositoryImpl.findOneAndUpdate(
      { assignmentId: assignment.id, periodKey: period.periodKey },
      {
        $setOnInsert: {
          assignmentId: assignment.id,
          formId: assignment.formId,
          userId: assignment.userId,
          versionId,
          frequency: assignment.frequency,
          periodKey: period.periodKey,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          dueDate: period.dueDate,
          status: FormOccurrenceStatus.PENDING,
        },
      },
      true,
      session,
    );
  }

  async createAssignments(
    formId: string,
    dto: CreateFormAssignmentDto,
    assignedById: string,
    session?: ClientSession,
  ): Promise<AssignmentResult[]> {
    const form = await this.formRepositoryImpl.findById(formId);
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }
    if (form.status !== FormStatus.PUBLISHED || !form.publishedVersionId) {
      throw new BadRequestException('فقط فرم منتشرشده قابل تخصیص است.');
    }

    const results: AssignmentResult[] = [];
    // Frequency and start date are optional (no schedule / starts now).
    const frequency = dto.frequency ?? FormAssignmentFrequency.NO_SCHEDULE;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();

    for (const userId of dto.userIds) {
      try {
        const existingActive = await this.formAssignmentRepositoryImpl.findOne({
          formId,
          userId,
          isActive: true,
        });
        if (existingActive) {
          results.push({
            userId,
            success: false,
            message: 'این فرم همین الان به این شخص تخصیص فعال دارد.',
          });
          continue;
        }

        const dueDate =
          frequency === FormAssignmentFrequency.ONCE && dto.dueDate
            ? new Date(dto.dueDate)
            : null;

        const [assignment] = await this.formAssignmentRepositoryImpl.create(
          {
            formId,
            userId,
            assignedBy: assignedById,
            frequency,
            startDate,
            dueDate,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            notifyEnabled: dto.notifyEnabled ?? true,
          },
          session,
        );

        if (frequency === FormAssignmentFrequency.ONCE) {
          await this.upsertOccurrence(
            assignment,
            form.publishedVersionId,
            { periodKey: 'once', periodStart: null, periodEnd: null, dueDate },
            session,
          );
        } else if (RECURRING_FREQUENCIES.includes(frequency)) {
          const period = resolvePeriod(frequency, new Date());
          if (period) {
            await this.upsertOccurrence(
              assignment,
              form.publishedVersionId,
              period,
              session,
            );
          }
        }
        // NO_SCHEDULE: no occurrence yet - created on-demand when the
        // employee opens the form (handled by the response/workflow phase).

        results.push({ userId, success: true, assignmentId: assignment.id });
      } catch (err: any) {
        results.push({
          userId,
          success: false,
          message: err?.message || 'خطا در تخصیص فرم به این شخص.',
        });
      }
    }

    return results;
  }

  async listAssignmentsForForm(formId: string) {
    return this.formAssignmentRepositoryImpl.find(
      { formId },
      null,
      null,
      null,
      { createdAt: -1 },
      'user',
    );
  }

  async deactivateAssignment(assignmentId: string, userId: string) {
    const assignment = await this.formAssignmentRepositoryImpl.findById(
      assignmentId,
    );
    if (!assignment) {
      throw new NotFoundException('تخصیص مورد نظر یافت نشد.');
    }
    if (!assignment.isActive) {
      return assignment;
    }
    await this.formAssignmentRepositoryImpl.updateById(assignmentId, {
      isActive: false,
      deactivatedBy: userId,
      deactivatedAt: new Date(),
    });
    return this.formAssignmentRepositoryImpl.findById(assignmentId);
  }

  async generateDueOccurrencesForAllActiveAssignments() {
    const now = new Date();
    const assignments = await this.formAssignmentRepositoryImpl.find({
      isActive: true,
      frequency: { $in: RECURRING_FREQUENCIES },
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    });

    for (const assignment of assignments) {
      try {
        const form = await this.formRepositoryImpl.findById(assignment.formId);
        if (
          !form ||
          form.status !== FormStatus.PUBLISHED ||
          !form.publishedVersionId
        ) {
          continue;
        }
        const period = resolvePeriod(assignment.frequency, now);
        if (!period) continue;

        await this.upsertOccurrence(
          assignment,
          form.publishedVersionId,
          period,
        );
      } catch (err) {
        console.error(
          `[form-builder] failed generating occurrence for assignment ${assignment.id}`,
          err,
        );
      }
    }
  }

  async getCurrentOccurrenceForAssignment(assignment: FormAssignmentDocument) {
    if (assignment.frequency === FormAssignmentFrequency.ONCE) {
      return this.formOccurrenceRepositoryImpl.findOne({
        assignmentId: assignment.id,
        periodKey: 'once',
      });
    }

    if (RECURRING_FREQUENCIES.includes(assignment.frequency)) {
      const now = new Date();
      const current = await this.formOccurrenceRepositoryImpl.findOne({
        assignmentId: assignment.id,
        periodStart: { $lte: now },
        periodEnd: { $gte: now },
      });
      if (current) return current;

      const [latest] = await this.formOccurrenceRepositoryImpl.find(
        { assignmentId: assignment.id },
        null,
        0,
        1,
        { periodStart: -1 },
      );
      return latest ?? null;
    }

    // NO_SCHEDULE has no single "current" occurrence - the employee sees
    // the full history on the assignment detail page instead.
    return null;
  }

  async listMyAssignments(userId: string) {
    const assignments = await this.formAssignmentRepositoryImpl.find({
      userId,
      isActive: true,
    });

    const rows = [];
    for (const assignment of assignments) {
      const form = await this.formRepositoryImpl.findById(
        assignment.formId,
        'category',
      );
      if (!form) continue;

      const currentOccurrence = await this.getCurrentOccurrenceForAssignment(
        assignment,
      );

      rows.push({
        assignmentId: assignment.id,
        frequency: assignment.frequency,
        form: {
          id: form.id,
          title: form.title,
          code: form.code,
          category: form.category,
        },
        currentOccurrence: currentOccurrence
          ? {
              id: currentOccurrence.id,
              status: currentOccurrence.status,
              dueDate: currentOccurrence.dueDate,
              isOverdue: Boolean(
                currentOccurrence.dueDate &&
                  new Date(currentOccurrence.dueDate) < new Date() &&
                  currentOccurrence.status !== FormOccurrenceStatus.COMPLETED,
              ),
            }
          : null,
      });
    }

    return rows;
  }

  async getMyAssignmentDetail(assignmentId: string, userId: string) {
    const assignment = await this.formAssignmentRepositoryImpl.findById(
      assignmentId,
    );
    if (!assignment || assignment.userId.toString() !== userId) {
      throw new NotFoundException('تخصیص مورد نظر یافت نشد.');
    }

    const form = await this.formRepositoryImpl.findById(
      assignment.formId,
      'category',
    );
    if (!form) {
      throw new NotFoundException('فرم مورد نظر یافت نشد.');
    }

    const occurrences = await this.formOccurrenceRepositoryImpl.find(
      { assignmentId },
      null,
      null,
      null,
      { createdAt: -1 },
    );

    return { assignment, form, occurrences };
  }

  // Resolves the occurrence the employee should land on when they click
  // "تکمیل فرم جدید" / open the assigned form - reusing an open draft if one
  // exists (never silently replace an in-progress occurrence), and minting a
  // new free-standing occurrence once the prior ones are finalized.
  async ensureRespondableOccurrence(
    assignmentId: string,
    userId: string,
    session?: ClientSession,
  ) {
    const assignment = await this.formAssignmentRepositoryImpl.findById(
      assignmentId,
    );
    if (!assignment || assignment.userId.toString() !== userId) {
      throw new NotFoundException('تخصیص مورد نظر یافت نشد.');
    }
    if (!assignment.isActive) {
      throw new ForbiddenException('این تخصیص دیگر فعال نیست.');
    }

    const form = await this.formRepositoryImpl.findById(assignment.formId);
    if (!form || !form.publishedVersionId) {
      throw new BadRequestException('این فرم در حال حاضر قابل تکمیل نیست.');
    }
    // Archived: existing (already opened) occurrences stay usable below, but
    // no new occurrence is ever created (spec 5.3).
    const isArchived = form.status === FormStatus.ARCHIVED;

    // While an assignment is active the employee can always fill the form
    // again: an open draft is continued, otherwise a new free-standing
    // submission is created - for every frequency. The frequency only drives
    // the scheduled (period) occurrences, reminders and overdue tracking.
    if (assignment.frequency !== FormAssignmentFrequency.NO_SCHEDULE) {
      const current = await this.getCurrentOccurrenceForAssignment(assignment);
      if (current && current.status !== FormOccurrenceStatus.COMPLETED) {
        return current;
      }
    }

    const [open] = await this.formOccurrenceRepositoryImpl.find(
      { assignmentId, status: { $ne: FormOccurrenceStatus.COMPLETED } },
      null,
      0,
      1,
      { createdAt: -1 },
    );
    if (open) {
      return open;
    }
    if (isArchived) {
      throw new BadRequestException(
        'این فرم بایگانی شده و نوبت جدیدی برای آن ایجاد نمی‌شود.',
      );
    }

    try {
      const [created] = await this.formOccurrenceRepositoryImpl.create(
        {
          assignmentId,
          formId: assignment.formId,
          userId,
          versionId: form.publishedVersionId,
          frequency: assignment.frequency,
          periodKey: null,
          periodStart: null,
          periodEnd: null,
          dueDate: null,
          status: FormOccurrenceStatus.PENDING,
          openSlot: 'open',
        },
        session,
      );
      return created;
    } catch (err: any) {
      // A concurrent request already opened the occurrence (unique openSlot).
      if (err?.code === 11000) {
        throw new ConflictException(
          'نوبت جدید همین الان در حال ایجاد است؛ لطفاً دوباره تلاش کنید.',
        );
      }
      throw err;
    }
  }
}
