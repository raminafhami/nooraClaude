import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ElasticFilterRules } from 'src/common/const/enums';

export class SearchFilterDto {
  @IsString()
  property: string;

  @IsEnum(ElasticFilterRules)
  rule: ElasticFilterRules;

  @IsString()
  value: string;
}

export class SearchBodyDto {
  // Pagination parameters
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 0; // Default to page 1 if not provided

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  size?: number = 10; // Default to 10 results per page if not provided

  // Sort parameters
  @IsOptional()
  @IsString()
  sort?: string;

  // Array of filter parameters
  @IsOptional()
  filters?: string[]; // Filters based on IElasticFiltering

  // Full-text search query parameter
  @IsOptional()
  @IsString()
  query?: string; // Optional free-text search query

  @IsOptional()
  groupBy?: string;

  @IsOptional()
  aggFunc?: string[];

  @IsString()
  @IsOptional()
  select?: string = '';
}
