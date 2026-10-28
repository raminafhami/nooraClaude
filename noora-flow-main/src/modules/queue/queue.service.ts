import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { gregorianDateTimeToJalali } from 'src/common/providers/moment-date';
import * as moment from 'moment-jalaali';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('indexing') private readonly indexingQueue: Queue,
    @InjectQueue('reminder') private readonly reminderQueue: Queue,
    @InjectQueue('welcome-message') private readonly welcomeMessageQueue: Queue,
    @InjectQueue('warehouse') private readonly warehouseQueue: Queue,
    private readonly i18nService: I18nService,
  ) {}

  async indexInstance(instance: any) {
    await this.indexingQueue.add('index-instance', instance, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexDebt(debt: any) {
    await this.indexingQueue.add('index-debt', debt, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexInspectionCost(inspectionCost: any) {
    await this.indexingQueue.add('index-inspection-cost', inspectionCost, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexDenormalizedInstance(denormalizedInstance: any) {
    await this.indexingQueue.add(
      'index-denormalized-instance',
      denormalizedInstance,
      {
        removeOnComplete: true,
        attempts: 2,
      },
    );
  }

  async indexUser(user: any) {
    await this.indexingQueue.add('index-user', user, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexIncome(income: any) {
    await this.indexingQueue.add('index-income', income, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexInvoice(invoice: any) {
    await this.indexingQueue.add('index-invoice', invoice, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  async indexUserTask(userTask: any) {
    await this.indexingQueue.add('index-user-task', userTask, {
      removeOnComplete: true,
      attempts: 2,
    });
  }

  // `buyer` / `customer`: names, given for a buyer's or customer's activity
  // (then `type` is call / meeting / task); `link`: page the notification
  // opens. A reminder that is missing or already past is not queued.
  async addReminder(doc: any) {
    const {
      reminderMethod,
      reminder,
      type,
      title,
      description,
      assignee,
      phoneNo,
      deadline,
      activityId,
      buyer,
      customer,
      link,
    } = doc;

    const delay = reminder ? new Date(reminder).getTime() - Date.now() : NaN;
    if (!reminderMethod || !(delay > 0)) return;

    const isActivity = !!(buyer || customer);
    const typeLabel = type
      ? this.i18nService.translate(`common.${type}`, { lang: 'fa' })
      : null;
    // SMS templates: the buyer template's TITLE is the activity type
    const translatedTitle = buyer ? typeLabel ?? title : title;

    const format = isActivity ? 'jYYYY/jMM/jDD HH:mm' : 'jYYYY/jMM/jDD';

    const jalaliDate =
      parseInt(gregorianDateTimeToJalali(deadline)) > 0
        ? moment(deadline).utcOffset('+03:30').format(format)
        : 0;

    const message = isActivity
      ? `یادآوری: شما یک ${typeLabel ?? 'فعالیت'} با عنوان «${title}» مربوط به ${buyer ?? customer} در تاریخ ${jalaliDate} دارید.`
      : `یادآوری: شما یک تسک با عنوان ${title} در تاریخ ${jalaliDate} دارید.`;

    await this.reminderQueue.add(
      'send-reminder',
      {
        description,
        reminderMethod,
        message,
        phoneNo,
        assignee,
        deadline,
        activityId,
        jalaliDate,
        translatedTitle,
        buyer,
        link,
      },
      {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async getJobByActivityId(activityId: string) {
    const jobs = await this.reminderQueue.getJobs(['waiting', 'delayed']);
    const job = jobs.find((j) => j.data.activityId === activityId);

    return job || null;
  }

  async welcomeMessage(doc: any) {
    const { lastname, phoneNo } = doc;

    await this.welcomeMessageQueue.add(
      'send-welcome-message',
      {
        phoneNo,
        lastname,
      },
      {
        delay: 5000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async warehouseQuantityAlert(doc: any) {
    const { quantity, userId, productName } = doc;
    const message = `هشدار موجودی انبار`;
    const description = ` موجودی ${productName} به حد هشدار رسیده است. لطفا برای تامین موجودی اقدام نمایید.`;

    await this.warehouseQueue.add(
      'quantity-alert',
      {
        message,
        userId,
        description,
      },
      {
        delay: 5000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async invoiceExpiryAlert(doc: any) {
    const {
      phoneNo,
      remainingTime,
      invoiceAmount,
      invoiceNo,
      encryptedInvoice,
    } = doc;
    await this.reminderQueue.add(
      'invoice-expiry-message',
      {
        phoneNo,
        remainingTime,
        invoiceAmount,
        invoiceNo,
        encryptedInvoice,
      },
      {
        delay: 5000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
