import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InvoiceItem {
  @IsNotEmpty()
  @IsString()
  duty: string;

  @IsNotEmpty()
  @IsString()
  fee: string;

  @IsNotEmpty()
  @IsString()
  tax: string;

  @IsNotEmpty()
  @IsString()
  quantity: string;

  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @IsNotEmpty()
  @IsString()
  itemDescription: string;
}

export class InsertInvoiceDto {
  @IsOptional()
  number: string;

  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  deliveryLocation: string;

  @IsNotEmpty()
  @IsString()
  saleTypeNumber: string;

  @IsOptional()
  description: string;

  @IsArray()
  @Type(() => InvoiceItem)
  invoiceItems: InvoiceItem[];
}
