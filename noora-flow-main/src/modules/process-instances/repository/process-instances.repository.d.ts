import { BaseRepositry } from 'src/base/base.repository';
import { ProcessInstanceDocument } from '../schemas/process-instances.schema';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto } from '../dtos';

export interface ProcessInstanceRepository
  extends BaseRepositry<ProcessInstanceDocument> {
  create(setting: CreateProcessInstanceDto): Promise<ProcessInstanceDocument>;

  updateMany(
    condition: any,
    setValues: UpdateProcessInstanceDto,
  ): Promise<ProcessInstanceDocument>;
}
