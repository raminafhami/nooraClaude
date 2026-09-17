import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsInt,
  IsBoolean,
  ValidateNested,
  IsDate,
  IsDateString,
  IsEmail,
  IsObject,
  IsArray,
  IsNumber,
  IsOptional,
  IsIn,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class Params {
  [key: string]: any;
}

export class CreateProcessInstanceDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  checkCredit?: boolean = false;

  @ApiProperty()
  @IsOptional()
  cnId?: string;

  @ApiProperty()
  @IsOptional()
  feasibilityProcessInstanceId?: string;
}

export class DuplicateInstanceDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludes: string[] = [];
}

export class GetOneProcessInstanceQueryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly version: number;
}
