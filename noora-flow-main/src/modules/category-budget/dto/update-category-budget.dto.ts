import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryBudgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}
