import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchRasmioDto {
  @IsString()
  @IsOptional()
  projection?: string;

  @IsString()
  @IsNotEmpty()
  term: string;
}
