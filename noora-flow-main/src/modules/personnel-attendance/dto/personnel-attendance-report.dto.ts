import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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

export class PersonnelAttendanceReportDto {
    @ApiProperty({
        default: 0,
    })
    @IsNumber()
    @Type(() => Number)
    readonly page: number;

    @ApiProperty({
        default: 10,
    })
    @IsNumber()
    @Type(() => Number)
    readonly size: number;

    @IsString()
    @ApiProperty()
    dateFrom: string

    @IsString()
    @ApiProperty()
    dateTo: string

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly sort: string;

    @IsOptional()
    populate: any;
}