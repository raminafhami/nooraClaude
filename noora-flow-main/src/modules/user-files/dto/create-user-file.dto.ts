import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserFileStatus } from '../schemas/user-file.schema';

export class CreateUserFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserFileStatus)
  status: string;
}
