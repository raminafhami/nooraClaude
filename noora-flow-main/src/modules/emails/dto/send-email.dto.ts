import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  to: string[];

  @IsNotEmpty()
  @IsString()
  html: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (!!value ? value.split(',') : undefined))
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (!!value ? value.split(',') : undefined))
  bcc?: string[];

  @ApiProperty({
    description: 'Attachments',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  files: any[];

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isUserEmail: boolean;
}
