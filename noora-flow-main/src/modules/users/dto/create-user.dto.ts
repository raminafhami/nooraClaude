import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { UserTypes } from '../schemas/user.schema';
import { ApiHideProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsOptional()
  username?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  // @MaxLength(10)
  // @MinLength(10)
  nationalCode?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  phoneNo?: string;

  @IsOptional()
  @IsString({ each: true })
  groups?: string[];

  @IsNotEmpty()
  // @IsEnum(UserTypes)
  type: string; // type:UserTypes

  @IsOptional()
  branchId?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  sepidarId?: string;

  @IsOptional()
  postalCode?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsString()
  @ApiHideProperty()
  loginType?: string;

  @IsString()
  @IsOptional()
  industryId?: string;

  @IsString()
  @IsOptional()
  subIndustryId?: string;

  @IsString()
  @IsOptional()
  referralSource?: string;

  @IsString()
  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
