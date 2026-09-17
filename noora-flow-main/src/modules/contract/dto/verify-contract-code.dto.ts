import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class VerifyContractCodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  code: string;

  @IsOptional()
  @ApiHideProperty()
  phone?: string;
}
