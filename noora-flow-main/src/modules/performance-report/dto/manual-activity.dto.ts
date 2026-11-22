import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateManualActivityDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  organizationalUnitId?: string;

  @IsMongoId()
  activityTypeId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  colleagueIds: string[];

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsIn(['completed', 'incomplete'])
  status: 'completed' | 'incomplete';

  @IsOptional()
  @IsString()
  incompleteReason?: string;
}

export class UpdateManualActivityDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  organizationalUnitId?: string;

  @IsOptional()
  @IsMongoId()
  activityTypeId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  colleagueIds?: string[];

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsIn(['completed', 'incomplete'])
  status?: 'completed' | 'incomplete';

  @IsOptional()
  @IsString()
  incompleteReason?: string;
}

export class ActivityTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  groupId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;
}

export class ChartQueryDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  range?: 'day' | 'week' | 'month';

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  activityTypeId?: string;

  @IsOptional()
  @IsIn(['system', 'manual'])
  origin?: 'system' | 'manual';

  @IsOptional()
  @IsString()
  sourceModule?: string;
}
