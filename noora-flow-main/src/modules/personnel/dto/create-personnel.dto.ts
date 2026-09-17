import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AcademicType } from '../schemas/personnel.schema';

export class CreatePersonnelDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  personnelCode: string;

  @IsOptional()
  @IsString()
  internalPhoneNo: string;

  @IsNotEmpty()
  @IsString()
  fatherName: string;

  @IsNotEmpty()
  @IsString()
  birthCertificateNo: string;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  birthPlace: string;

  @IsArray()
  @ApiProperty({ type: [AcademicType] })
  @Type(() => AcademicType)
  academics: AcademicType[];

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  landlineNo: string;

  @IsArray()
  @IsString({ each: true })
  jobs: string[];

  @IsOptional()
  @IsString()
  maxExtraTime?: string;

  @IsOptional()
  @IsNumber()
  maxDayLeave?: number;

  @IsOptional()
  @IsNumber()
  maxManualTime?: number;
}
