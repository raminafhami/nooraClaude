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
import { TasksService } from './tasks.service';
import { Executor } from './providers';

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(WsExceptionsFilter)
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'tasks' })
export class TasksGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly tasksService: TasksService,
    private readonly executor: Executor,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.tasksService.setSocket(server);
    this.executor.setSocket(server);
  }

  async handleConnection(client: Socket) {
    return 'connected';
  }

  async handleDisconnect(client: Socket) {
    return 'disconnected';
  }

  @SubscribeMessage('init')
  async loginUser(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.tasksService.getUserFromSocket(client);
    client.join(user.id.toString()); // create userRoom
    const taskCount = await this.tasksService.getTodoTaskCount(user);
    client.emit('init', { taskCount });
  }
}
