import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProjectDocument } from './schemas/project.schema';
import { ProjectRepositoryImpl } from './repositories/project.repository';

@Injectable()
export class ProjectService extends CrudService<ProjectDocument> {
  constructor(private readonly projectRepositoryImpl: ProjectRepositoryImpl) {
    super(projectRepositoryImpl);
  }
}
