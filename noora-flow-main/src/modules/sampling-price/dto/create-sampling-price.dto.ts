import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddSamplingPriceVersionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateSamplingPriceDto extends AddSamplingPriceVersionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  processKeys?: string[];
}

export class AddPricesListDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsString()
  amount: string;
}

export class UpsertSamplingIncomeCategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
