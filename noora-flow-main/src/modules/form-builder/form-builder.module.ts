import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { IndicatorModule } from '../indicator/indicator.module';
import { UserFilesModule } from '../user-files/user-files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  FormCategory,
  FormCategorySchema,
} from './schemas/form-category.schema';
import { FormBuilderForm, FormSchema } from './schemas/form.schema';
import { FormVersion, FormVersionSchema } from './schemas/form-version.schema';
import {
  FormAssignment,
  FormAssignmentSchema,
} from './schemas/form-assignment.schema';
import {
  FormOccurrence,
  FormOccurrenceSchema,
} from './schemas/form-occurrence.schema';
import {
  FormResponse,
  FormResponseSchema,
} from './schemas/form-response.schema';
import {
  FormReminderLog,
  FormReminderLogSchema,
} from './schemas/form-reminder-log.schema';
import { FormShare, FormShareSchema } from './schemas/form-share.schema';
import { FormCategoryRepositoryImpl } from './repository/form-category.repository';
import { FormRepositoryImpl } from './repository/form.repository';
import { FormVersionRepositoryImpl } from './repository/form-version.repository';
import { FormAssignmentRepositoryImpl } from './repository/form-assignment.repository';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormResponseRepositoryImpl } from './repository/form-response.repository';
import { FormReminderLogRepositoryImpl } from './repository/form-reminder-log.repository';
import { FormShareRepositoryImpl } from './repository/form-share.repository';
import { FormCategoryService } from './form-category.service';
import { FormService } from './form.service';
import { FormAssignmentService } from './form-assignment.service';
import { FormResponseService } from './form-response.service';
import { FormPdfService } from './form-pdf.service';
import { FormNotificationService } from './form-notification.service';
import { FormShareService } from './form-share.service';
import { FormReportService } from './form-report.service';
import { FormBuilderController } from './form-builder.controller';
import { FormResponseController } from './form-response.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormCategory.name, schema: FormCategorySchema },
      { name: FormBuilderForm.name, schema: FormSchema },
      { name: FormVersion.name, schema: FormVersionSchema },
      { name: FormAssignment.name, schema: FormAssignmentSchema },
      { name: FormOccurrence.name, schema: FormOccurrenceSchema },
      { name: FormResponse.name, schema: FormResponseSchema },
      { name: FormReminderLog.name, schema: FormReminderLogSchema },
      { name: FormShare.name, schema: FormShareSchema },
    ]),
    IndicatorModule,
    UserFilesModule,
    NotificationsModule,
  ],
  controllers: [FormBuilderController, FormResponseController],
  providers: [
    FormCategoryRepositoryImpl,
    FormRepositoryImpl,
    FormVersionRepositoryImpl,
    FormAssignmentRepositoryImpl,
    FormOccurrenceRepositoryImpl,
    FormResponseRepositoryImpl,
    FormReminderLogRepositoryImpl,
    FormShareRepositoryImpl,
    FormCategoryService,
    FormService,
    FormAssignmentService,
    FormResponseService,
    FormPdfService,
    FormNotificationService,
    FormShareService,
    FormReportService,
    CronJobService,
  ],
  exports: [
    FormCategoryService,
    FormService,
    FormAssignmentService,
    FormResponseService,
  ],
})
export class FormBuilderModule {}
