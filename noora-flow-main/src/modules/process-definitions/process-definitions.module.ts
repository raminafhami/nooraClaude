import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Compiler } from '../process-instances/providers';
import { ProcessDefinitionController } from './process-definitions.rest.controller';
import { ProcessDefinitionService } from './process-definitions.service';
import {
  ProcessDefinition,
  ProcessDefinitionSchema,
} from './schemas/process-definitions.schema';
import { ProcessDefinitionRepositoryImpl } from './repository/process-definitions.repository.impl';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProcessDefinition.name, schema: ProcessDefinitionSchema },
    ]),
  ],
  controllers: [ProcessDefinitionController],
  providers: [
    ProcessDefinitionService,
    ProcessDefinitionRepositoryImpl,
    // GrpcConnector,
    Compiler,
  ],
  exports: [ProcessDefinitionService],
})
export class ProcessDefinitionsModule {}
