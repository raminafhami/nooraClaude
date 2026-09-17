import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssetRequirementDto {
  @IsNotEmpty()
  @IsString()
  questionDescription: string;

  @IsOptional()
  @IsString()
  paraNumber: string;

  @IsNotEmpty()
  @IsString()
  parent: string;

  @IsNotEmpty()
  @IsString()
  auditId: string;

  @IsOptional()
  @IsBoolean()
  state: boolean;
}

export class UploadAssetFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
