import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class PayInvoiceDto {
  @IsArray()
  @IsNotEmpty()
  invoiceIds: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'Date must be in the format YYYY/MM/DD',
  })
  date: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  financialDocumentId?: string;

  @ValidateIf((o) => o.financialDocumentId == undefined)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  dlCode: string;

  @ValidateIf((o) => o.financialDocumentId == undefined)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  slCode: string;

  @ValidateIf((o) => o.financialDocumentId == undefined)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  trackingCode: string;
}
