import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Item {
  @IsNumber()
  Credit: number;

  @IsNotEmpty()
  @IsString()
  DLCode: string;

  @IsNumber()
  Debit: number;

  @IsNotEmpty()
  @IsString()
  Description: string;

  @IsNotEmpty()
  @IsString()
  SLCode: string;
}

export class InsertVoucherDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  headerDescription: string;

  @IsArray()
  @Type(() => Item)
  items: Item[];
}
