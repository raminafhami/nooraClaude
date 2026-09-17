import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateBuyerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty()
  nationalCode: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsArray()
  @IsString({ each: true })
  contactNo: string[];

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  metadata: any;

  @IsArray()
  @IsString({ each: true })
  branches: string[];

  @IsString()
  @IsOptional()
  industryId?: string;

  @IsString()
  @IsOptional()
  subIndustryId?: string;

  @IsString()
  @IsOptional()
  referralSource?: string;
}
