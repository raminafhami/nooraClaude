import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InvoiceItemDto {
  @IsString()
  @IsOptional()
  incomeId?: string;

  @IsOptional()
  @IsString()
  caseNo?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
