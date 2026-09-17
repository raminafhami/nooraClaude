import { Injectable } from '@nestjs/common';
import { Model, SortValues } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import {
  NotificationMessage,
  NotificationMessageDocument,
} from '../schemas/notification-message.schema';

@Injectable()
export class NotificationsRepositoryImpl extends BaseRepositoryImpl<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    protected notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationMessage.name)
    public notificationMessageModel: Model<NotificationMessageDocument>,
  ) {
    super(notificationModel);
  }

  async bulkCreateNotificationMessage(data: any) {
    const bulk = data.map((item) => {
      return { insertOne: { document: item } };
    });
    return this.notificationMessageModel.bulkWrite(bulk);
  }

  async createNotificationMessage(data: any) {
    return this.notificationMessageModel.create(data);
  }

  async findMessages(
    where?: any,
    projection?: any,
    page?: number,
    limit?: number,
    sort?: string | { [key: string]: SortValues },
    populate?: any,
  ) {
    let mongoQuery = this.notificationMessageModel
      .find(where, projection)
      .populate(populate);
    if (page !== undefined && limit !== undefined) {
      mongoQuery = mongoQuery.skip(page * limit).limit(limit);
    }
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }
    return mongoQuery.exec();
  }

  async countMessages(query: any): Promise<any> {
    return this.notificationMessageModel.count(query).exec();
  }
}
