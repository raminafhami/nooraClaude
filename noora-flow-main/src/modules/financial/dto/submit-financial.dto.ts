import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class Case {
  @IsOptional()
  invoiceNo: string;

  @IsNotEmpty()
  caseNo: string;

  @IsNotEmpty()
  fee: string;

  @IsNotEmpty()
  tax: string;

  @IsNotEmpty()
  toll: string;

  @IsNotEmpty()
  total: string;
}

export class SubmitFinancialDto {
  @IsNotEmpty()
  payerSepidarId: string;

  @IsNotEmpty()
  bankAccount: string;

  @IsNotEmpty()
  receiptNo: string;

  @IsNotEmpty()
  paymentAmount: number;

  @IsNotEmpty()
  // @MinLength(10)
  // @MaxLength(10)
  paymentDate: string;

  @IsNotEmpty()
  @IsIn(['official', 'unofficial'])
  invoiceType: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Case)
  cases: Case[];
}
