import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  ValidateIf,
  IsArray,
} from 'class-validator';
import { ActivityType, ReminderMethod } from 'src/common/const/enums';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ActivityType)
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsNotEmpty()
  @IsDateString()
  deadline: Date;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  buyerId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  reminder?: Date;

  @ValidateIf((o) => o.reminder !== null && o.reminder !== undefined)
  @IsNotEmpty({ message: 'Reminder method is required.' })
  @IsEnum(ReminderMethod)
  reminderMethod: string;

  @IsOptional()
  @IsArray()
  labels: string[];

  @IsString()
  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
