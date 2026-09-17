import { BadRequestException, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthenticationService } from '../iam/authentication/authentication.service';
import { WsException } from '@nestjs/websockets';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { NotificationDocument } from './schemas/notification.schema';
import { NotificationsRepositoryImpl } from './repository/notification.repository';
import { UsersService } from '../users/services/users.service';
import { NotificationsGateway } from './notifications.gateway';
import { CustomMessages } from 'src/common/const/custom-messages';

@Injectable()
export class NotificationsService extends CrudService<NotificationDocument> {
  public socket: Server = null;
  constructor(
    private readonly notificationRepositoryImpl: NotificationsRepositoryImpl,
    private readonly authService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {
    super(notificationRepositoryImpl);
  }

  async getUserFromSocket(client: Socket) {
    const token =
      client.handshake.auth.token || client.handshake.headers.authorization;

    const user = await this.authService.getUserFromToken(token);
    if (!user) {
      throw new WsException({
        status: 'failure',
        description: 'Invalid credentials.',
        statusCode: 401,
      });
    }
    return user;
  }

  async sendNotification(notification: any) {
    let userIds = [];

    if (
      !!notification?.recipient?.groups &&
      notification?.recipient?.groups?.length != 0
    ) {
      userIds = await this.usersService.filterUsers({
        groups: { $in: notification.recipient?.groups },
      });
    }
    userIds = [...new Set(userIds.concat(notification.recipient?.users || []))];

    const notificationData = {
      title: notification.title,
      description: notification.description,
      category: notification.category,
      priority: notification.priority,
    };
    const data = userIds.map((userId: string) => {
      return {
        userId,
        notificationId: notification.id,
        ...notificationData,
      };
    });

    const messages = await Promise.all(
      data.map((messageData) => {
        return this.notificationRepositoryImpl.createNotificationMessage(
          messageData,
        );
      }),
    );
    messages.forEach((m) => {
      this.socket.to(m.userId.toString()).emit('newNotification', m);
    });
  }

  async findAllNotificationMessages(queryDto: any) {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (queryDto.filters) {
        filters = JSON.parse(queryDto.filters);
        condition.$and.push(filters);
      }

      if (queryDto.search) {
        const search = JSON.parse(queryDto.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (queryDto.sort) {
        sort = JSON.parse(queryDto.sort);
      }
    } catch (err) {
      throw new BadRequestException(
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    if (condition.$and.length == 0) {
      condition = {};
    }

    const count = await this.notificationRepositoryImpl.countMessages(
      condition,
    );
    const data = await this.notificationRepositoryImpl.findMessages(
      condition,
      queryDto?.projection,
      queryDto.page,
      queryDto.size,
      sort,
      queryDto.populate,
    );
    condition.$and.push({ readedAt: null });

    const unreadCount = await this.notificationRepositoryImpl.countMessages(
      condition,
    );
    return { data, count, unreadCount };
  }

  async seenNotificationMessage(userId: string, messageId: string) {
    return this.notificationRepositoryImpl.notificationMessageModel.findOneAndUpdate(
      { _id: messageId, userId },
      { readedAt: new Date() },
      { new: true },
    );
  }

  async seenAllNotificationMessages(userId: string) {
    const date = new Date();
    await this.notificationRepositoryImpl.notificationMessageModel.updateMany(
      { userId, readedAt: { $eq: null } },
      { readedAt: date },
    );
    return date;
  }
}
