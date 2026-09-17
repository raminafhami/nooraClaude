import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserTaskDto, UpdateUserTaskDto } from 'src/modules/tasks/dtos';
import { UserTasksRepository } from './user-tasks.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UserTasks, UserTasksDocument } from '../schemas/user-tasks.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class UserTasksRepositoryImpl
  extends BaseRepositoryImpl<UserTasksDocument>
  implements UserTasksRepository
{
  constructor(
    @InjectModel(UserTasks.name)
    protected UserTaskModel: Model<UserTasksDocument>,
  ) {
    super(UserTaskModel);
  }

  create(object: CreateUserTaskDto): Promise<UserTasksDocument> {
    const event = new this.UserTaskModel(object);
    return event.save();
  }

  update(id: string, object: UpdateUserTaskDto): Promise<UserTasksDocument> {
    return this.UserTaskModel.findOneAndUpdate({ _id: id }, object, {
      new: true,
    }).exec();
  }

  insertMany(array: CreateUserTaskDto[]): Promise<any> {
    return this.UserTaskModel.insertMany(array);
  }
}
