import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SmsService } from '../sms/sms.service';

@Processor('welcome-message')
export class WelcomeMessageProcessor {
  constructor(private readonly smsService: SmsService) {}

  @Process('send-welcome-message')
  async handleWelcomeMessage(job: Job) {
    await this.smsService.sendWelcomeMessage(job.data);
  }
}
