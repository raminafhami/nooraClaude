import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePettyCashDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsArray()
  categoryIds: string[];

  @IsOptional()
  @IsString()
  bankShebaNumber?: string;

  @IsOptional()
  @IsString()
  bankCardNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
