import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Put,
} from '@nestjs/common';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiTags('notifications')
@ApiBearerAuth('token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.NOTIFICATION,
  })
  @Post()
  async create(
    @ActiveUser() user: ActiveUserData,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    let notification;
    if (createNotificationDto.sendNotification) {
      notification = await this.notificationsService.create({
        ...createNotificationDto,
        isPublished: true,
        createdBy: user.id,
      });
      await this.notificationsService.sendNotification(notification);
    } else {
      notification = await this.notificationsService.create({
        ...createNotificationDto,
        createdBy: user.id,
      });
    }
    return notification;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.NOTIFICATION,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = '-recipient';
    const data = await this.notificationsService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.NOTIFICATION,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationsService.findById(id);
    if (!notification) {
      throw new NotFoundException('notification not exist');
    }
    return notification;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.NOTIFICATION,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newNotification = await this.notificationsService.findOneAndUpdate(
      { _id: id, isPublished: false },
      {
        ...updateNotificationDto,
        modifyBy: user.id,
      },
    );
    if (!newNotification) {
      throw new NotFoundException('notification not exist or cant update');
    }
    return newNotification;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.NOTIFICATION,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.notificationsService.deleteOne({
      _id: id,
      isPublished: false,
    });
    if (!checkDeleted) {
      throw new NotFoundException('notification not exist or cant delete.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.NOTIFICATION,
  })
  @Post(':id/send')
  async sendNotification(
    @ActiveUser() user: ActiveUserData,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationsService.findOneAndUpdate(
      {
        _id: id,
        isPublished: false,
      },
      { isPublished: true, modifyBy: user.id },
    );
    if (!notification) {
      throw new NotFoundException(
        'notification not exist or cant send this notification',
      );
    }
    await this.notificationsService.sendNotification(notification);

    return notification;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.NOTIFICATION_MESSAGE,
  })
  @Put('messages/:messageId/seen')
  async seenMessage(
    @Param('messageId') messageId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const message = await this.notificationsService.seenNotificationMessage(
      user.id,
      messageId,
    );
    if (!message) {
      throw new NotFoundException('message not exist');
    }
    return message;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.NOTIFICATION_MESSAGE,
  })
  @Put('messages/seen')
  async seenAllMessage(@ActiveUser() user: ActiveUserData) {
    const readedAt =
      await this.notificationsService.seenAllNotificationMessages(user.id);
    return { readedAt };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.NOTIFICATION_MESSAGE,
  })
  @Get('messages/list')
  async findMessages(
    @ActiveUser() user: ActiveUserData,
    @Query() queryDto: GetQueryDto,
  ) {
    const filter = JSON.parse(queryDto.filters || '{}');
    filter.userId = user.id;
    queryDto.filters = JSON.stringify(filter);
    queryDto.sort = JSON.stringify({ createdAt: -1 });
    const data = await this.notificationsService.findAllNotificationMessages(
      queryDto,
    );
    return data;
  }
}
