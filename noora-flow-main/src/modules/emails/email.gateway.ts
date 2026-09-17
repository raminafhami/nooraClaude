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
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(WsExceptionsFilter)
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'emails' })
export class EmailGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly emailService: EmailService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.emailService.setSocket(server);
  }

  async handleConnection(client: Socket) {
    return 'connected';
  }

  async handleDisconnect(client: Socket) {
    return 'disconnected';
  }

  @SubscribeMessage('init')
  async loginUser(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.emailService.getUserFromSocket(client);
    client.join(user.id.toString()); // create userRoom
    client.emit('init', { success: true });
  }
}
