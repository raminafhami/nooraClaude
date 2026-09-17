import { Module, forwardRef } from '@nestjs/common';
import { ProjectTaskService } from './project-task.service';
import { ProjectTaskController } from './project-task.controller';
import { ProjectTaskRepositoryImpl } from './repositories/project-task.repository';
import { ProjectTask, ProjectTaskSchema } from './schemas/project-task.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from '../project/project.module';
import { QueueModule } from '../queue/queue.module';
import { UsersModule } from '../users/users.module';
import { IndicatorModule } from '../indicator/indicator.module';
import { AppConfigModule } from 'src/config/app/config.module';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([
      { name: ProjectTask.name, schema: ProjectTaskSchema },
    ]),
    QueueModule,
    UsersModule,
    IndicatorModule,
    AppConfigModule,
    IamModule,
  ],
  controllers: [ProjectTaskController],
  providers: [ProjectTaskService, ProjectTaskRepositoryImpl],
  exports: [ProjectTaskService, ProjectTaskRepositoryImpl],
})
export class ProjectTaskModule {}
