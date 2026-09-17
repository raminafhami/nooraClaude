import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PettyCostStatus } from 'src/common/const/enums';

export class UpdatePettyCostStatusDto {
  @IsNotEmpty()
  @IsArray()
  costIds: string[];

  @IsNotEmpty()
  @IsEnum(PettyCostStatus)
  status: string;
}

export class UpdateUnofficialPettyCostDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  spentDate?: string;

  @IsOptional()
  @IsNumber()
  currencyRate?: number;
}

export class UpdateUnofficialPettyCostDateDto {
  @IsOptional()
  @IsArray()
  costIds?: string[];

  @IsNotEmpty()
  @IsString()
  spentDate: string;
}
