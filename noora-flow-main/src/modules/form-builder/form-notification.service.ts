import { Injectable, OnModuleInit } from '@nestjs/common';
import * as moment from 'moment-jalaali';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority } from '../notifications/enums';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormAssignmentRepositoryImpl } from './repository/form-assignment.repository';
import { FormRepositoryImpl } from './repository/form.repository';
import { FormReminderLogRepositoryImpl } from './repository/form-reminder-log.repository';
import { FormOccurrenceStatus } from './schemas/form-occurrence.schema';
import { FormReminderType } from './schemas/form-reminder-log.schema';
import { TEHRAN_UTC_OFFSET_MINUTES } from './utils/period.util';

// Days before the due date to send the "upcoming" reminder (spec only says
// "یادآوری قبل از سررسید" without a fixed number, so this picks a sane
// default rather than inventing a configurable setting nobody asked for).
const REMINDER_BEFORE_DUE_DAYS = 3;

@Injectable()
export class FormNotificationService implements OnModuleInit {
  constructor(
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
    private readonly formAssignmentRepositoryImpl: FormAssignmentRepositoryImpl,
    private readonly formRepositoryImpl: FormRepositoryImpl,
    private readonly formReminderLogRepositoryImpl: FormReminderLogRepositoryImpl,
    private readonly notificationsService: NotificationsService,
    private readonly cronJobService: CronJobService,
  ) {}

  onModuleInit() {
    this.cronJobService.startJob(
      '0 7 * * *',
      () => this.sendDueReminders(),
      'Asia/Tehran',
      'formBuilderDueReminders',
    );
  }

  private resolveReminderType(dueDate: Date): FormReminderType | null {
    const daysUntilDue = moment(dueDate)
      .utcOffset(TEHRAN_UTC_OFFSET_MINUTES)
      .startOf('day')
      .diff(
        moment().utcOffset(TEHRAN_UTC_OFFSET_MINUTES).startOf('day'),
        'days',
      );

    if (daysUntilDue === REMINDER_BEFORE_DUE_DAYS) {
      return FormReminderType.BEFORE_DUE;
    }
    if (daysUntilDue === 0) {
      return FormReminderType.DUE;
    }
    if (daysUntilDue < 0) {
      return FormReminderType.OVERDUE;
    }
    return null;
  }

  async sendDueReminders() {
    // Only occurrences with a real due date are candidates - this naturally
    // excludes NO_SCHEDULE occurrences (spec 17.10: no periodic due-date
    // notifications for them) since they're created with dueDate: null.
    const occurrences = await this.formOccurrenceRepositoryImpl.find({
      status: { $ne: FormOccurrenceStatus.COMPLETED },
      dueDate: { $ne: null },
    });

    for (const occurrence of occurrences) {
      try {
        const reminderType = this.resolveReminderType(occurrence.dueDate);
        if (!reminderType) continue;

        const assignment = await this.formAssignmentRepositoryImpl.findById(
          occurrence.assignmentId,
        );
        if (!assignment || !assignment.isActive || !assignment.notifyEnabled) {
          continue;
        }

        const alreadySent = await this.formReminderLogRepositoryImpl.findOne({
          occurrenceId: occurrence.id,
          reminderType,
        });
        if (alreadySent) continue;

        const form = await this.formRepositoryImpl.findById(occurrence.formId);
        if (!form) continue;

        const notification = await this.notificationsService.create({
          title: 'یادآوری تکمیل فرم',
          description: `فرم ${form.title} را در اسرع وقت تکمیل نمایید. با تشکر.`,
          category: 'form-builder',
          priority:
            reminderType === FormReminderType.OVERDUE
              ? NotificationPriority.HIGH
              : NotificationPriority.MEDIUM,
          recipient: { users: [occurrence.userId], groups: [] },
          link: `/dashboard/profile/forms/${occurrence.assignmentId}/respond/${occurrence.id}`,
          isPublished: true,
          createdBy: occurrence.userId,
        });
        await this.notificationsService.sendNotification(notification);

        await this.formReminderLogRepositoryImpl.create({
          occurrenceId: occurrence.id,
          reminderType,
          sentAt: new Date(),
        });
      } catch (err) {
        console.error(
          `[form-builder] failed sending reminder for occurrence ${occurrence.id}`,
          err,
        );
      }
    }
  }
}
