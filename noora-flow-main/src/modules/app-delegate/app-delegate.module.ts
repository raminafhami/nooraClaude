import { Global, Module } from '@nestjs/common';
import { AppDelegateService } from './app-delegate.service';
import { UsersModule } from '../users/users.module';
import { SmsModule } from '../sms/sms.module';

@Global()
@Module({
  imports: [UsersModule, SmsModule],
  providers: [AppDelegateService],
  exports: [AppDelegateService],
})
export class AppDelegateModule {}
