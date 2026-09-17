import { IsArray, IsDateString, IsIn, IsNotEmpty } from 'class-validator';

export enum PeriodEnum {
  DAY = 'day',
  MONTH = 'month',
  WEEK = 'week',
  YEAR = 'year',
}

export class InstanceReportDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsArray()
  definitionKey: string[];

  @IsIn(Object.values(PeriodEnum))
  period: string = PeriodEnum.DAY;
}
