import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './schemas/form.schema';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { FormsRepositoryImpl } from './repositories/form.repository';
import { SubmissionsRepositoryImpl } from './repositories/submission.repository';
import { UsersModule } from '../users/users.module';
import { IndicatorModule } from '../indicator/indicator.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Form.name, schema: FormSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    UsersModule,
    IndicatorModule,
  ],
  controllers: [FormController],
  providers: [FormService, FormsRepositoryImpl, SubmissionsRepositoryImpl],
})
export class FormModule {}
