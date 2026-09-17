import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class InsertCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsString()
  nationalCode: string;

  @IsString()
  address: string;

  @IsString()
  contactNo: string;

  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsBoolean()
  isCustomer: boolean;

  @IsOptional()
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['legal', 'natural'])
  type: string;
}
