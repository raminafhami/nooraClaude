import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TasksController } from './tasks.rest.controller';
import { TasksService } from './tasks.service';
import { Compiler } from '../process-instances/providers';
import { Executor } from './providers';
import { HttpConnector } from 'src/shared/connectors';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProcessInstance,
  ProcessInstanceSchema,
} from '../process-instances/schemas/process-instances.schema';
import {
  ProcessDefinition,
  ProcessDefinitionSchema,
} from '../process-definitions/schemas/process-definitions.schema';
import { UserTasks, UserTasksSchema } from './schemas/user-tasks.schema';
import { ProcessDefinitionRepositoryImpl } from '../process-definitions/repository/process-definitions.repository.impl';
import { ProcessInstanceRepositoryImpl } from '../process-instances/repository/process-instances.repository.impl';
import { UserTasksRepositoryImpl } from './repository/user-tasks.repository.impl';
import { ConnectorConfig } from './providers/connector-config';
import { UsersModule } from '../users/users.module';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { AppConfigModule } from 'src/config/app/config.module';
import { TasksGateway } from './tasks.gateway';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTasks.name, schema: UserTasksSchema },
      { name: ProcessInstance.name, schema: ProcessInstanceSchema },
      { name: ProcessDefinition.name, schema: ProcessDefinitionSchema },
    ]),
    HttpModule,
    UsersModule,
    ProcessInstancesModule,
    AppConfigModule,
    IamModule,
  ],
  exports: [TasksService],
  controllers: [TasksController],
  providers: [
    TasksService,
    UserTasksRepositoryImpl,
    ProcessInstanceRepositoryImpl,
    ProcessDefinitionRepositoryImpl,
    HttpConnector,
    Compiler,
    Executor,
    ConnectorConfig,
    TasksGateway,
    // GrpcConnector,
  ],
})
export class TasksModule {}
