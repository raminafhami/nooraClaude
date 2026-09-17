import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DimensionsDto {
  @IsNumber()
  @IsNotEmpty()
  length: number;

  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsOptional()
  height?: number;
}
class LocationDto {
  @IsString()
  @IsNotEmpty()
  building: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  room?: string;
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  propertyNo: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  purchaseDate: Date;

  @IsNumber()
  @IsOptional()
  purchasePrice: number;

  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @IsNumber()
  @IsOptional()
  depreciationRate?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location: LocationDto;

  @IsDateString()
  @IsOptional()
  warrantyStart?: Date;

  @IsDateString()
  @IsOptional()
  warrantyEnd?: Date;

  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;

  @IsString()
  @IsOptional()
  insuranceCompany?: string;

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  technicalSpecifications?: string;

  @IsDateString()
  @IsOptional()
  calibrationDate?: Date;

  @IsDateString()
  @IsOptional()
  nextCalibrationDate?: Date;
}

export class UploadPropertyFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
