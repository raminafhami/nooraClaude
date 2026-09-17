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
  IsDateString,
  IsArray,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { ReminderMethod } from 'src/common/const/enums';

export class UpdateProjectTaskDto {
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
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsString()
  @IsOptional()
  comment?: string;

  @IsOptional()
  @IsDateString()
  reminder?: Date;

  @ValidateIf(o => o.reminder !== null && o.reminder !== undefined)
  @IsNotEmpty({ message: "Reminder method is required." })
  @IsEnum(ReminderMethod)
  reminderMethod: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isConfidential?:boolean;
}
