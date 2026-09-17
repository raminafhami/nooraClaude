import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class Pagination {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number = 0;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  size: number = 10;
}
