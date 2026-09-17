import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { currencies } from 'src/common/const/enums';

export class UpdateInspectionCostsDto {
  @IsArray()
  @IsNotEmpty()
  inspectionCostIds: string[];

  @IsEnum(currencies)
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  currencyRate: number;
}
