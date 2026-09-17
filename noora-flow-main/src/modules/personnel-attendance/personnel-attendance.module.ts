import { MiddlewareConsumer, Module, NestModule, RequestMethod, forwardRef } from '@nestjs/common';
import { PersonnelAttendanceService } from './personnel-attendance.service';
import { PersonnelAttendanceController } from './personnel-attendance.controller';
import { PersonnelAttendanceRepositoryImpl } from './repository/personnel-attendance.repository';
import { PersonnelAttendanceSchema } from './schemas/personnel-attendance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonnelModule } from '../personnel/personnel.module';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { PersonnelRequestService } from '../personnel-request/personnel-request.service';
import { PersonnelRequestModule } from '../personnel-request/personnel-request.module';
import { PersonnelRequestRepositoryImpl } from '../personnel-request/repository/personnel-request.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PersonnelAttendance', schema: PersonnelAttendanceSchema },
    ]),
    PersonnelModule,
    forwardRef(() => PersonnelRequestModule)
  ],
  controllers: [PersonnelAttendanceController],
  providers: [PersonnelAttendanceService, PersonnelAttendanceRepositoryImpl, CronJobService],
  exports: [PersonnelAttendanceService]
})
export class PersonnelAttendanceModule { }
