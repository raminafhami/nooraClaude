import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SmsService } from '../sms/sms.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { NotificationPriority } from '../notifications/enums';

@Processor('reminder')
export class ReminderProcessor {
  constructor(
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job) {
    if (job.data.reminderMethod === 'sms') {
      await this.smsService.sendRememberAlert(job.data);
    }

    if (job.data.reminderMethod === 'web-notification') {
      const { assignee, message, description } = job.data;
      const createNotification: CreateNotificationDto =
        new CreateNotificationDto();

      createNotification.category = 'reminder';
      createNotification.description = description;
      createNotification.priority = NotificationPriority.MEDIUM;
      createNotification.recipient = {
        users: [assignee],
        groups: [],
      };
      createNotification.title = message;

      let notification = await this.notificationService.create({
        ...createNotification,
        isPublished: true,
        createdBy: assignee,
      });

      await this.notificationService.sendNotification(notification);

      return notification;
    }
  }

  @Process('invoice-expiry-message')
  async handleInvoiceExpiryAlert(job: Job) {
    await this.smsService.sendInvoiceExpiryMessage(job.data);
  }
}
