import { Injectable } from '@nestjs/common';
import { CreateProjectTaskLabelDto } from './dto/create-project-task-label.dto';
import { UpdateProjectTaskLabelDto } from './dto/update-project-task-label.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProjectTaskLabelDocument } from './schemas/project-task-label.schema';
import { ProjectLabelRepositoryImpl } from './repositories/project-task-label.repository';

@Injectable()
export class ProjectTaskLabelService extends CrudService<ProjectTaskLabelDocument> {
  constructor(
    private readonly projectLabelRepository: ProjectLabelRepositoryImpl,
  ) {
    super(projectLabelRepository);
  }
}
