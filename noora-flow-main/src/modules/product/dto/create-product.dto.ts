import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startIndex: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  endIndex: number;

  @IsNotEmpty()
  @IsNumber()
  alertThreshold:number;
}

export class AddStockItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startIndex: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  endIndex: number;
}
