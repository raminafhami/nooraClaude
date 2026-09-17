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

export class CreatePersonnelAttendanceDto {
    @IsNotEmpty()
    @ApiProperty()
    time: string

}