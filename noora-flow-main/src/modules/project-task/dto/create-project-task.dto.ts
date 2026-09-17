import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  IsNumber,
  MaxLength,
  IsDate,
  IsDateString,
  IsArray,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { ReminderMethod } from 'src/common/const/enums';

export class CreateProjectTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @IsOptional()
  @IsNumber()
  priority: number;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsNumber()
  progress: number;

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsString()
  @IsOptional()
  comment?: string;

  @IsOptional()
  @IsDateString()
  reminder?: Date;

  @ValidateIf((o) => o.reminder !== null && o.reminder !== undefined)
  @IsNotEmpty({ message: 'Reminder method is required.' })
  @IsEnum(ReminderMethod)
  reminderMethod: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?:boolean;
}
