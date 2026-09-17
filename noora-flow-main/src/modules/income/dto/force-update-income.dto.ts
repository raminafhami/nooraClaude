import { ApiHideProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { currencies, UnitMeasure } from 'src/common/const/enums';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';

export class ForceUpdateIncomeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(currencies)
  currency?: string;

  @IsNumber()
  @IsOptional()
  currencyRate?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @IsEnum(UnitMeasure)
  unit?: string;

  @ApiHideProperty()
  activeUser?: ActiveUserData;
}
