import { Module, forwardRef } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ProcessInstanceController } from './process-instances.rest.controller';
import { ProcessInstanceService } from './process-instances.service';
import { Compiler } from './providers';
import { Executor } from '../tasks/providers';
import { HttpConnector } from 'src/shared/connectors';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProcessInstance,
  ProcessInstanceSchema,
} from './schemas/process-instances.schema';
import {
  ProcessDefinition,
  ProcessDefinitionSchema,
} from '../process-definitions/schemas/process-definitions.schema';
import { UserTasks, UserTasksSchema } from '../tasks/schemas/user-tasks.schema';
import { ProcessInstanceRepositoryImpl } from './repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from '../process-definitions/repository/process-definitions.repository.impl';
import { UserTasksRepositoryImpl } from '../tasks/repository/user-tasks.repository.impl';
import { IndicatorModule } from '../indicator/indicator.module';
import { ConnectorConfig } from '../tasks/providers/connector-config';
import { UsersModule } from '../users/users.module';
import { FilesModule } from '../files/files.module';
import { UserFile } from '../user-files/schemas/user-file.schema';
import { UserFilesModule } from '../user-files/user-files.module';
import { ContractNumberModule } from '../contract-number/contract-number.module';
import { IncomeModule } from '../income/income.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { InspectionCostsModule } from '../inspection-costs/inspection-costs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProcessInstance.name, schema: ProcessInstanceSchema },
      { name: ProcessDefinition.name, schema: ProcessDefinitionSchema },
      { name: UserTasks.name, schema: UserTasksSchema },
    ]),
    HttpModule,
    IndicatorModule,
    forwardRef(() => UsersModule),
    forwardRef(() => UserFilesModule),
    forwardRef(() => FilesModule),
    ContractNumberModule,
    forwardRef(() => IncomeModule),
    InvoiceModule,
    InspectionCostsModule,
  ],
  controllers: [ProcessInstanceController],
  providers: [
    ProcessInstanceService,
    ProcessInstanceRepositoryImpl,
    ProcessDefinitionRepositoryImpl,
    Compiler,
    Executor,
    UserTasksRepositoryImpl,
    HttpConnector,
    ConnectorConfig,
    // GrpcConnector,
  ],
  exports: [ProcessInstanceService],
})
export class ProcessInstancesModule {}
