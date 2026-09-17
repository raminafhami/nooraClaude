import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonnelAttendanceDto } from './create-personnel-attendance.dto';

export class UpdatePersonnelAttendanceDto extends PartialType(CreatePersonnelAttendanceDto) { }
