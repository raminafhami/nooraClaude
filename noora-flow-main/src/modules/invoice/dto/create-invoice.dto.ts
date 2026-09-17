import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InvoiceStatuses, InvoiceTypes } from 'src/common/const/enums';
import { IInvoiceItem } from '../interfaces/invoice-item.interface';
import { IRecipient } from '../interfaces/recipient.interface';
import { RecipientDto } from './recipient.dto';
import { InvoiceItemDto } from './invoice-item.dto';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  additionalFee?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsDateString()
  @IsOptional()
  expiryAt?: Date;

  @IsDate()
  @ApiHideProperty()
  @IsOptional()
  issuedAt?: Date;

  @IsArray()
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @ApiProperty({ type: [String] })
  incomeIds: string[];

  @ApiProperty({ type: RecipientDto })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RecipientDto)
  recipient: IRecipient;

  @IsString()
  @IsOptional()
  @ApiHideProperty()
  createdBy?: string;
}
