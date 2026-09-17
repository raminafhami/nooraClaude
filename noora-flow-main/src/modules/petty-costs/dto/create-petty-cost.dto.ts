import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CostTypes, currencies } from 'src/common/const/enums';

export class CreatePettyCostDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(CostTypes)
  type: string;

  @ValidateIf((o) => o.type === CostTypes.Official)
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  pettyCashIds?: string[];

  @ValidateIf((o) => o.amount * o.currencyRate >= 20000000)
  @IsNotEmpty({ message: 'Seller national code is required for high-value costs' })
  @IsString()
  sellerNationalCode?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(currencies)
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  currencyRate: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  hasVat?: boolean;

  @ValidateIf((o) => o.hasVat === true)
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ValidateIf((o) => o.type === CostTypes.Official)
  @IsString()
  spentDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
