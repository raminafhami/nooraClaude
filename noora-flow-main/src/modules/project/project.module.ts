import { Module, forwardRef } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectRepositoryImpl } from './repositories/project.repository';
import { Project, ProjectSchema } from './schemas/project.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectTaskModule } from '../project-task/project-task.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    forwardRef(() => ProjectTaskModule)
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepositoryImpl],
  exports: [ProjectService, ProjectRepositoryImpl]
})
export class ProjectModule { }
