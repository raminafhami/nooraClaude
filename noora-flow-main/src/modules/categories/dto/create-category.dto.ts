import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CategoryTypes } from 'src/common/const/enums';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsEnum(CategoryTypes)
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
