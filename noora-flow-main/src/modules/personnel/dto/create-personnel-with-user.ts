import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AcademicType } from '../schemas/personnel.schema';

class User {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  nationalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNo: string;

  @ApiProperty()
  @IsOptional()
  branchId?: string;

  @ApiProperty()
  @IsOptional()
  groups?: string[];
}

export class CreatePersonnelWithUserDto {
  @ApiProperty({ type: User })
  @IsNotEmpty()
  @Type(() => User)
  user: User;

  @ApiProperty()
  @IsOptional()
  @IsString()
  personnelCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  internalPhoneNo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthCertificateNo?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [AcademicType] })
  @Type(() => AcademicType)
  academics?: AcademicType[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  landlineNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maxExtraTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxDayLeave?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxManualTime?: number;
}
