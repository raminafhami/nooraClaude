import { Module } from '@nestjs/common';
import { ProjectTaskLabelService } from './project-task-label.service';
import { ProjectTaskLabelController } from './project-task-label.controller';
import { ProjectLabelRepositoryImpl } from './repositories/project-task-label.repository';
import {
  ProjectTaskLabel,
  ProjectTaskLabelSchema,
} from './schemas/project-task-label.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectTaskLabel.name, schema: ProjectTaskLabelSchema },
    ]),
  ],
  controllers: [ProjectTaskLabelController],
  providers: [ProjectTaskLabelService, ProjectLabelRepositoryImpl],
})
export class ProjectTaskLabelModule {}
