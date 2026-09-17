import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ProjectRepositoryImpl extends BaseRepositoryImpl<ProjectDocument> {
  constructor(
    @InjectModel(Project.name)
    protected projectModel: Model<ProjectDocument>,
  ) {
    super(projectModel);
  }
}
