import { forwardRef, Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { AppConfigModule } from 'src/config/app/config.module';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AppConfigModule, HttpModule, forwardRef(() => UsersModule)],
  providers: [SmsService, RedisModule],
  controllers: [SmsController],
  exports: [SmsService],
})
export class SmsModule {}
