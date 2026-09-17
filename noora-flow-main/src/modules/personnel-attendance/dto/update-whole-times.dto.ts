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

export class UpdateWholeTimesDto {
    @IsNotEmpty()
    @ApiProperty()
    times: string

    @IsOptional()
    @ApiProperty()
    userId?: string

    @IsNotEmpty()
    @ApiProperty()
    date: string

}