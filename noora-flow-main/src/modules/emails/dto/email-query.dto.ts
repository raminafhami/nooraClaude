import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EmailQueryDto {
  @ApiProperty({
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    default: 10,
  })
  @IsNumber()
  @Type(() => Number)
  size: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsBooleanString()
  unread?: string; // 'true' or 'false'

  @IsOptional()
  @IsDateString()
  after?: string; // ISO date (e.g., '2024-01-01')

  @IsOptional()
  @IsDateString()
  before?: string;
}
