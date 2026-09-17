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
  IsArray,
  IsDateString,
  IsISO8601,
  Matches,
} from 'class-validator';
import { string } from 'joi';
import { IsArrayValidDatesConstraint } from 'src/common/decorators/is-array-valid-dates-constraint.decorator';

export class CreatePersonnelScheduleDto {
  @IsArray()
  @ApiProperty()
  @IsNotEmpty()
  userIds: string[];

  @IsArray()
  @ApiProperty({ description: 'Dates should be Gregorian' })
  @IsNotEmpty()
  @IsArrayValidDatesConstraint()
  dates: string[];

  @IsString()
  @ApiProperty()
  @IsOptional()
  workingTimeRegulationId?: string;
}
