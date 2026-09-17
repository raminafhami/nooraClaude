import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class ManualTimeDto {
  @IsNotEmpty()
  @ApiProperty()
  entryTime: string;

  @IsNotEmpty()
  @ApiProperty()
  exitTime: string;

  @IsNotEmpty()
  @ApiProperty()
  date: string;

  @IsOptional()
  @ApiProperty({ required: false })
  singleTime?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  userId?: string;
}
