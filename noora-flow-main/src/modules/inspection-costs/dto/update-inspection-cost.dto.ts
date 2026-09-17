import { PartialType } from '@nestjs/mapped-types';
import { CreateInspectionCostDto } from './create-inspection-cost.dto';
import { OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { currencies } from 'src/common/const/enums';

export class UpdateInspectionCostDto extends PartialType(
  OmitType(CreateInspectionCostDto, [
    'caseStatus',
    'caseId',
    'caseNo',
  ] as const),
) {
  @IsOptional()
  @IsEnum(currencies)
  currency: string;

  @IsOptional()
  @IsNumber()
  currencyRate: number;
}

class ItemCost {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  total: string;
}
export class UpdateInspectionCostTotalDto {
  @IsArray()
  @Type(() => ItemCost)
  data: ItemCost[];
}
