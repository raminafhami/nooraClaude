import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { PersonnelAttendanceDocument } from '../schemas/personnel-attendance.schema';

@Injectable()
export class PersonnelAttendanceRepositoryImpl extends BaseRepositoryImpl<PersonnelAttendanceDocument> {
    constructor(
        @InjectModel("PersonnelAttendance")
        protected PersonnelAttendanceModel: Model<PersonnelAttendanceDocument>,
    ) {
        super(PersonnelAttendanceModel);
    }
}
