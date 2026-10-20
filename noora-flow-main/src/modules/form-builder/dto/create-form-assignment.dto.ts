import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { FormAssignmentFrequency } from '../schemas/form-assignment.schema';

export class CreateFormAssignmentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  userIds: string[];

  // Optional: without a frequency the form is "no schedule" (filled whenever
  // needed, no due dates or reminders).
  @IsOptional()
  @IsEnum(FormAssignmentFrequency)
  frequency?: FormAssignmentFrequency;

  // Optional: defaults to the assignment time.
  @IsOptional()
  @IsDateString()
  startDate?: string;

  // Only used for ONCE assignments; ignored otherwise.
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  notifyEnabled?: boolean;
}
