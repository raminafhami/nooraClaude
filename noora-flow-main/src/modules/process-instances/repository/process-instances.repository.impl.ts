import { Injectable, Scope } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { ProcessInstanceRepository } from './process-instances.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProcessInstance,
  ProcessInstanceDocument,
} from '../schemas/process-instances.schema';
import { CreateProcessInstanceDto, UpdateProcessInstanceDto } from '../dtos';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class ProcessInstanceRepositoryImpl
  extends BaseRepositoryImpl<ProcessInstanceDocument>
  implements ProcessInstanceRepository
{
  constructor(
    @InjectModel(ProcessInstance.name)
    protected ProcessInstanceModel: Model<ProcessInstanceDocument>,
  ) {
    super(ProcessInstanceModel);
  }

  create(object: CreateProcessInstanceDto): Promise<ProcessInstanceDocument> {
    const event = new this.ProcessInstanceModel(object);
    return event.save();
  }

  updateMany(
    condition: any,
    object: any,
    session?: ClientSession,
  ): Promise<any> {
    if (session)
      return this.ProcessInstanceModel.updateMany(condition, object, {
        session,
      }).exec();
    return this.ProcessInstanceModel.updateMany(condition, object).exec();
  }
}
