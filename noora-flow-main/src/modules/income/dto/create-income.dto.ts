import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { currencies, IncomeTypes, UnitMeasure } from 'src/common/const/enums';

export class CreateIncomeDto {
  @IsString()
  @IsOptional()
  instanceId?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  caseNo?: string;

  @IsString()
  @IsOptional()
  costId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  @IsEnum(IncomeTypes)
  type?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(currencies)
  currency: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsNotEmpty()
  currencyRate: number = 1;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsEnum(UnitMeasure)
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsNotEmpty()
  discount: number = 0;

  @IsNumber()
  @IsNotEmpty()
  additionalFee: number = 0;

  @IsNumber()
  @IsNotEmpty()
  duty: number = 0;

  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsBoolean()
  hasTax?: boolean;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  refIncomeId?: string;
}
