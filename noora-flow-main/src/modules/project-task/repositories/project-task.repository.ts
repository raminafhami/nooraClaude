import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  ProjectTask,
  ProjectTaskDocument,
} from '../schemas/project-task.schema';

@Injectable()
export class ProjectTaskRepositoryImpl extends BaseRepositoryImpl<ProjectTaskDocument> {
  constructor(
    @InjectModel(ProjectTask.name)
    protected projectTaskModel: Model<ProjectTaskDocument>,
  ) {
    super(projectTaskModel);
  }
}
