import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCategoryBudgetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  dateFrom?: string;

  @IsNotEmpty()
  dateTo?: string;
}
