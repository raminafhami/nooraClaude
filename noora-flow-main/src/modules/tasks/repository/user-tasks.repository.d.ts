import { BaseRepositry } from 'src/base/base.repository';
import { UserTasksDocument } from '../schemas/user-tasks.schema';
import { CreateUserTaskDto, UpdateUserTaskDto } from '../dtos';

export interface UserTasksRepository extends BaseRepositry<UserTasksDocument> {
  create(task: CreateUserTaskDto): Promise<UserTasksDocument>;
  insertMany(tasks: CreateUserTaskDto[]): Promise<any>;
  update(id: string, user: UpdateUserTaskDto): Promise<UserTasksDocument>;
}
