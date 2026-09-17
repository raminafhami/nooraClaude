import { Module, forwardRef } from '@nestjs/common';
import { PersonnelRequestService } from './personnel-request.service';
import { PersonnelRequestController } from './personnel-request.controller';
import { PersonnelRequestRepositoryImpl } from './repository/personnel-request.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonnelRequestSchema } from './schemas/personnel-request.schema';
import { PersonnelAttendanceModule } from '../personnel-attendance/personnel-attendance.module';

@Module({
  imports:
    [MongooseModule.forFeature([
      { name: 'PersonnelRequest', schema: PersonnelRequestSchema },
    ]), forwardRef(() => PersonnelAttendanceModule)],
  controllers: [PersonnelRequestController],
  providers: [PersonnelRequestService, PersonnelRequestRepositoryImpl],
  exports: [PersonnelRequestService]
})
export class PersonnelRequestModule { }
