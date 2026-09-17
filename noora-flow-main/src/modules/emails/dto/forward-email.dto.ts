import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ForwardEmailDto {
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  to: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bcc?: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  html: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  folder: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  messageUid: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeAttachments: boolean;

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
}
