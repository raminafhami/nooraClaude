import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  ProjectTaskLabel,
  ProjectTaskLabelDocument,
} from '../schemas/project-task-label.schema';

@Injectable()
export class ProjectLabelRepositoryImpl extends BaseRepositoryImpl<ProjectTaskLabelDocument> {
  constructor(
    @InjectModel(ProjectTaskLabel.name)
    protected projectTaskLabelModel: Model<ProjectTaskLabelDocument>,
  ) {
    super(projectTaskLabelModel);
  }
}
