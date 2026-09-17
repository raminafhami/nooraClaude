import { IsNotEmpty, IsString } from 'class-validator';

export class GetCategoryBudgetDto {
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  @IsString()
  categoryId:string
}
