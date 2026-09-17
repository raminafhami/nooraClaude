import { IsArray } from 'class-validator';

export class RevertInvoiceDto {
  @IsArray()
  invoiceIds: string[];
}
