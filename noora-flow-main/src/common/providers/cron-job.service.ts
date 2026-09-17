import { Injectable } from '@nestjs/common';
import * as cron from 'cron';
@Injectable()
export class CronJobService {
  startJob(time: string, func: any, timeZone: string, jobName?: string) {
    const job = new cron.CronJob(time, func, null, true, timeZone);
    job.start();
    console.log(`${jobName} job has been started`);
  }
}
