import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { IamModule } from '../iam/iam.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { Personnel, PersonnelSchema } from '../personnel/schemas/personnel.schema';
import {
  ProcessInstance,
  ProcessInstanceSchema,
} from '../process-instances/schemas/process-instances.schema';
import {
  ProjectTask,
  ProjectTaskSchema,
} from '../project-task/schemas/project-task.schema';
import { UserTasks, UserTasksSchema } from '../tasks/schemas/user-tasks.schema';
import { UserGroup, UserGroupSchema } from '../user-groups/schemas/user-group.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PerformanceReportBootstrap } from './performance-report.bootstrap';
import { PerformanceReportController } from './performance-report.controller';
import { PerformanceReportService } from './performance-report.service';
import {
  PerformanceActivityType,
  PerformanceActivityTypeSchema,
} from './schemas/activity-type.schema';
import {
  DailyActivityReport,
  DailyActivityReportSchema,
} from './schemas/daily-report.schema';
import { ManualActivity, ManualActivitySchema } from './schemas/manual-activity.schema';

@Module({
  imports: [
    IamModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: PerformanceActivityType.name, schema: PerformanceActivityTypeSchema },
      { name: ManualActivity.name, schema: ManualActivitySchema },
      { name: DailyActivityReport.name, schema: DailyActivityReportSchema },
      { name: User.name, schema: UserSchema },
      { name: UserGroup.name, schema: UserGroupSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Personnel.name, schema: PersonnelSchema },
      { name: UserTasks.name, schema: UserTasksSchema },
      { name: ProjectTask.name, schema: ProjectTaskSchema },
      { name: ProcessInstance.name, schema: ProcessInstanceSchema },
    ]),
  ],
  controllers: [PerformanceReportController],
  providers: [
    PerformanceReportService,
    PerformanceReportBootstrap,
    CronJobService,
  ],
  exports: [PerformanceReportService],
})
export class PerformanceReportModule {}
