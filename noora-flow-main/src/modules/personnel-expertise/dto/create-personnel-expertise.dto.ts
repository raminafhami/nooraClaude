import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePersonnelExpertiseDto {
  @IsNotEmpty()
  @IsString()
  expertiseId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  data: any;
}

export class CreatePersonnelExpertiseWithCertificateDto {
  @IsNotEmpty()
  @IsString()
  expertiseId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @Type(() => Object)
  data: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @IsNotEmpty()
  @IsDateString()
  certificateDate: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
