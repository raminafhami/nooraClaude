import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFormCategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
