import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSamplingPriceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  branchId: string;
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
