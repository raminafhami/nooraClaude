import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReplyEmailDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (!!value ? value.split(',') : undefined))
  cc?: string[];

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
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isReplyAll: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  folder: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  messageUid: number;

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
