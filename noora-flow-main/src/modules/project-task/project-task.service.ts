import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProjectTaskDocument } from './schemas/project-task.schema';
import { Server, Socket } from 'socket.io';

import { ProjectTaskRepositoryImpl } from './repositories/project-task.repository';
import { AuthenticationService } from '../iam/authentication/authentication.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ProjectTaskService extends CrudService<ProjectTaskDocument> {
  private projectTaskSocket: Server;
  setSocket(server: Server) {
    this.projectTaskSocket = server;
  }
  constructor(
    private readonly projectTaskRepositoryImpl: ProjectTaskRepositoryImpl,
    private authService: AuthenticationService,
  ) {
    super(projectTaskRepositoryImpl);
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

  async getProjectTaskCount(user: any): Promise<any> {}
}
