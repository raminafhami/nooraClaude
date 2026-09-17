import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateIndicatorDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  format: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  counter: number;
}
