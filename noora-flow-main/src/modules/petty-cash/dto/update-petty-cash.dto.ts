import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePettyCashDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  bankShebaNumber?: string;

  @IsOptional()
  @IsString()
  bankCardNumber?: string;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];
}
