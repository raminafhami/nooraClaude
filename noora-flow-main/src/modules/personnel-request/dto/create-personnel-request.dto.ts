import { ApiProperty } from '@nestjs/swagger';
import { PERSONNEL_REQUEST_TYPE } from '../schemas/personnel-request.schema';
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

export class CreatePersonnelRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  dateFrom: string;

  @ApiProperty()
  @IsNotEmpty()
  dateTo: string;

  @ApiProperty()
  @IsOptional()
  timeFrom?: string;

  @ApiProperty()
  @IsOptional()
  timeTo?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PERSONNEL_REQUEST_TYPE)
  type: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  entitlement: boolean;

  @ApiProperty()
  @IsOptional()
  deputyId?: string;
}
