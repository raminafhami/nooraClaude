import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  InspectionCostCaseStatus,
  InspectionCostMethod,
  InspectionCostPeriod,
  InspectionCostType,
} from '../schemas/inspection-cost.schema';
import { currencies } from 'src/common/const/enums';

export class CreateInspectionCostDto {
  @IsNotEmpty()
  @IsString()
  caseId: string;

  @IsNotEmpty()
  @IsString()
  caseNo: string;

  @IsOptional()
  @IsEnum(InspectionCostCaseStatus)
  caseStatus?: InspectionCostCaseStatus;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  personId?: string;

  @IsOptional()
  personName?: string;

  @IsOptional()
  ruleId?: string;

  @IsOptional()
  @IsEnum(InspectionCostType)
  type: InspectionCostType;

  @IsOptional()
  @IsEnum(InspectionCostMethod)
  method: InspectionCostMethod;

  @IsOptional()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  total: string;

  @IsOptional()
  @IsEnum(InspectionCostPeriod)
  period: InspectionCostPeriod;

  @IsOptional()
  description: string;

  @IsEnum(currencies)
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  currencyRate?: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
