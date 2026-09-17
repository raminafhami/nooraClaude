import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { IamModule } from '../iam/iam.module';
import { NotificationsController } from './notifications.controller';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationsRepositoryImpl } from './repository/notification.repository';
import {
  NotificationMessage,
  NotificationMessageSchema,
} from './schemas/notification-message.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: NotificationSchema, name: Notification.name },
      { schema: NotificationMessageSchema, name: NotificationMessage.name },
    ]),
    IamModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    NotificationsGateway,
    NotificationsService,
    NotificationsRepositoryImpl,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
