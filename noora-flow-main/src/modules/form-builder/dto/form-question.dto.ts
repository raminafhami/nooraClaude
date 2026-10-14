import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FormQuestionType } from '../schemas/form-version.schema';

export class FormQuestionOptionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  @Type(() => Number)
  order: number;
}

export class FormQuestionSettingsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLength?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minValue?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  decimals?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scaleMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scaleMax?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormQuestionOptionDto)
  options?: FormQuestionOptionDto[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxFiles?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxFileSizeMb?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];
}

export class FormQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(FormQuestionType)
  type: FormQuestionType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormQuestionSettingsDto)
  settings?: FormQuestionSettingsDto;
}
