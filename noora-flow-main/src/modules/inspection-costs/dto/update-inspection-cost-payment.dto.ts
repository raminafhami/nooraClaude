import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  isNotEmpty,
} from 'class-validator';
import { InspectionCostStatus } from '../schemas/inspection-cost.schema';
import { Type } from 'class-transformer';

export class UpdateInspectionCostPaymentDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsNotEmpty()
  @IsString()
  caseId: string;

  @IsNotEmpty()
  @IsString()
  caseNo: string;
}

class ItemVoucher {
  @IsNotEmpty()
  @IsString()
  voucherNo: number;

  @IsNotEmpty()
  @IsDateString()
  date: Date;
}

class ItemVoucherUpdate {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsArray()
  @Type(() => ItemVoucher)
  vouchers: ItemVoucher[];
}
export class UpdateInspectionCostPaymentVoucherDto {
  @IsArray()
  @Type(() => ItemVoucherUpdate)
  data: ItemVoucherUpdate[];
}
