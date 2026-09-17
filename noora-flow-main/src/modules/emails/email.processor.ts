import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';
import { EmailStatus } from 'src/common/const/enums';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger('EmailProcessor');
  constructor(private readonly emailService: EmailService) {}

  @Process()
  async handleEmailJob(job: Job) {
    const { id } = job.data;
    let { userId } = job.data;
    const { attachments, ...otherData } = job.data;
    let isSystem = false;
    if (userId.startsWith('system')) {
      isSystem = true;
      userId = userId.split(':')[1];
    }
    this.emailService.updateStatus({
      id,
      newStatus: EmailStatus.SENDING,
    });
    this.emailService.emitEmailStatus(userId, EmailStatus.SENDING);

    this.logger.debug('Processing job in queue');
    // this.logger.debug({ id: job.id, data: otherData });

    try {
      let data = null;
      if (!isSystem) {
        data = await this.emailService.processUserEmail(job.data);
      } else {
        data = await this.emailService.processSystemEmail(job.data);
      }
      this.emailService.emitEmailStatus(userId, EmailStatus.SUCCESS);
      return data;
    } catch (e) {
      this.emailService.updateStatus({
        id,
        newStatus: EmailStatus.FAILED,
      });
      this.emailService.emitEmailStatus(userId, EmailStatus.SENDING);
    }
  }
}
