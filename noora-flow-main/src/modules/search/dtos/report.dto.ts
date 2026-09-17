import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export enum PeriodEnum {
  DAY = 'day',
  MONTH = 'month',
  WEEK = 'week',
  YEAR = 'year',
}
export class ReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(Object.values(PeriodEnum))
  period?: string = PeriodEnum.YEAR;
}

export class DebtReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(Object.values(PeriodEnum))
  period?: string = PeriodEnum.YEAR;

  @IsOptional()
  isPaid?: boolean = true;
}

export class UserReportDto {
  @IsNotEmpty()
  @IsString()
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  dateTo: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number;

  @IsOptional()
  @IsString()
  sort?:string = 'asc';
}

export class RecentProcessesDto {
  @IsOptional()
  @IsString()
  processDefinitionKey?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number = 3;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number = 10;

  @IsOptional()
  @IsString()
  sort?:string = 'asc';
}

export class UserFileReportDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number = 10;
}

export class UserTaskReportDto {
  @IsNotEmpty()
  @IsString()
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  dateTo: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number = 10;
}

export class ProcessCompletionReportDto {
  @IsNotEmpty()
  @IsString()
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  dateTo: string;
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number = 10;
}
