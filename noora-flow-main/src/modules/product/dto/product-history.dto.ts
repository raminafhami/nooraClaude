import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductTransferDto {
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @IsNotEmpty()
  @IsString()
  stockId: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsOptional()
  @IsString()
  description: string;

  // @IsNotEmpty()
  // @IsDateString()
  // date: Date;
}

export class CreateProductTransferBatchDto extends PartialType(
  OmitType(CreateProductTransferDto, ['stockId'] as const),
) {}

class ChangeHistoryDataItemDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  usedCodes: number[];

  @IsNotEmpty()
  productId: string;
}

export class ChangeHistoryDataDto {
  @IsArray()
  @ArrayNotEmpty()
  historyItems: ChangeHistoryDataItemDto[];
}
