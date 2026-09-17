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


export class ConfirmOrRejectPersonnelRequestsDto {
    @ApiProperty()
    @IsNotEmpty()
    personnelRequestIds: string[]

    @ApiProperty({ enum: ["confirmed", "rejected"] })
    @IsNotEmpty()
    status: string
}