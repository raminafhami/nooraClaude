import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { NotificationPriority } from '../notifications/enums';

@Processor('warehouse')
export class WarehouseProcessor {
  constructor(
    private readonly notificationService: NotificationsService,
  ) {}

  @Process('quantity-alert')
  async handleWarehouseQuantityAlert(job: Job) {

      const {message, userId , description} = job.data;
      const createNotification: CreateNotificationDto =
        new CreateNotificationDto();

      createNotification.category = 'warehouse-quantity';
      createNotification.description = description;
      createNotification.priority = NotificationPriority.MEDIUM;
      createNotification.recipient = {
        users: [userId],
        groups: [],
      };
      createNotification.title = message;

      let notification = await this.notificationService.create({
        ...createNotification,
        isPublished: true,
        createdBy: userId,
      });

      await this.notificationService.sendNotification(notification);

      return notification;
    
  }
}
