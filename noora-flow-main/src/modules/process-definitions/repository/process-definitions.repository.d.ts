import { BaseRepositry } from 'src/base/base.repository';
import {
  CreateProcessDefinitionDto,
  UpdateProcessDefinitionDto,
} from '../dtos';
import { ProcessDefinitionDocument } from '../schemas/process-definitions.schema';

export interface ProcessDefinitionRepository
  extends BaseRepositry<ProcessDefinitionDocument> {
  create(
    setting: CreateProcessDefinitionDto,
  ): Promise<ProcessDefinitionDocument>;
  update(
    condition: any,
    user: UpdateProcessDefinitionDto,
  ): Promise<ProcessDefinitionDocument>;
}
