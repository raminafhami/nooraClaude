import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { RedisConfigModule } from 'src/config/database/redis/config.module';
import { RedisConfigService } from 'src/config/database/redis/config.service';
import { SearchModule } from '../search/search.module';
import { SmsModule } from '../sms/sms.module';
import { ReminderProcessor } from './reminder.processor';
import { NotificationsModule } from '../notifications/notifications.module';
import { WelcomeMessageProcessor } from './welcome-message.processor';
import { WarehouseProcessor } from './warehouse.processor';

@Module({
  imports: [
    SearchModule,
    BullModule.registerQueue({
      name: 'indexing',
    }),
    BullModule.registerQueue({
      name: 'reminder',
    }),
    BullModule.registerQueue({
      name: 'welcome-message',
    }),
    BullModule.registerQueue({
      name: 'warehouse',
    }),
    BullModule.registerQueue({
      name: 'invoice-expiry-message',
    }),
    SmsModule,
    NotificationsModule,
  ],
  providers: [
    QueueService,
    QueueProcessor,
    ReminderProcessor,
    WelcomeMessageProcessor,
    WarehouseProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
