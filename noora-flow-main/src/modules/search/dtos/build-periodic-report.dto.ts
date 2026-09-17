import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PeriodEnum } from './report.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ElasticFilterRules } from 'src/common/const/enums';
import { Type } from 'class-transformer';

export class SearchFilterDto {
  @IsString()
  property: string;

  @IsEnum(ElasticFilterRules)
  rule: ElasticFilterRules;

  @IsString()
  value: string;
}

export class BuildPeriodicReportDto {
  @ApiHideProperty()
  @IsString()
  @IsOptional()
  index?: string;

  @IsOptional()
  query: any;

  @IsOptional()
  aggs: any;

  // Array of filter parameters
  @IsOptional()
  filters?: string[]; // Filters based on IElasticFiltering

  @ApiProperty({ enum: PeriodEnum })
  @IsEnum(PeriodEnum)
  @IsString()
  @IsNotEmpty()
  period: string;

  @IsOptional()
  aggFunc?: string[];

  @IsString()
  @IsNotEmpty()
  groupBy: string;

  @IsString()
  @IsOptional()
  select?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  size?: number = 100; // Default to 10 results per page if not provided

  @ApiHideProperty()
  @IsOptional()
  compiledAggFunc?: any;
}
