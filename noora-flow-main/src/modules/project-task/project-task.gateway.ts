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
import { ProjectTaskService } from './project-task.service';

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(WsExceptionsFilter)
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'project-tasks' })
export class ProjectTaskGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly projectTaskService: ProjectTaskService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.projectTaskService.setSocket(server);
  }

  async handleConnection(client: Socket) {
    return 'connected';
  }

  async handleDisconnect(client: Socket) {
    return 'disconnected';
  }

  @SubscribeMessage('init')
  async loginUser(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.projectTaskService.getUserFromSocket(client);
    client.join(user.id.toString()); // create userRoom
    const taskCount = await this.projectTaskService.getProjectTaskCount(user);
    client.emit('init', { taskCount });
  }
}
