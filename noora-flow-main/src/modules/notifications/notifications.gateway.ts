import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { Server, Socket } from 'socket.io';

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(WsExceptionsFilter)
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly notificationsService: NotificationsService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    this.notificationsService.socket = server;
  }

  async handleConnection(): Promise<string> {
    return 'connected';
  }

  async handleDisconnect(client: Socket): Promise<any> {
    return 'disconnected';
  }
  @SubscribeMessage('init')
  async loginUser(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.notificationsService.getUserFromSocket(client);
    client.join(user.id.toString()); // create userRoom
    const query = {
      page: 0,
      size: 10,
      filters: JSON.stringify({ userId: user.id }),
      sort: JSON.stringify({ createdAt: -1 }),
    };
    const notifications =
      await this.notificationsService.findAllNotificationMessages(query);
    client.emit('init', notifications);
  }

  @SubscribeMessage('seenNotificationMessage')
  async seenNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<any> {
    const user = await this.notificationsService.getUserFromSocket(client);
    const message = await this.notificationsService.seenNotificationMessage(
      user.id,
      data.messageId,
    );
    if (!message) {
      throw new WsException({
        description: 'message not exist',
        statusCode: 404,
      });
    }
    client.emit('seenNotificationMessage', {
      success: true,
    });
  }
}
