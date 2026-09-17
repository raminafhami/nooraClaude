import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  duty?: number;

  @IsString()
  @IsOptional()
  issueNo?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
