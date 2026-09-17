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
  Matches,
} from 'class-validator';
import { date, string } from 'joi';

export class CreateWorkingTimeRegulationDto {
  @IsNotEmpty()
  @ApiProperty()
  entryTime: string;

  @IsNotEmpty()
  @ApiProperty()
  exitTime: string;

  @IsNotEmpty()
  @ApiProperty()
  flexible: string;

  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  legalExtra: string;

  @IsOptional()
  @ApiProperty()
  isActive: boolean
}
