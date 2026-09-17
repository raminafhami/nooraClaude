import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { RecipientDto } from './recipient.dto';
import { IRecipient } from '../interfaces/recipient.interface';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceTypes } from 'src/common/const/enums';

export class CreateInvoiceManuallyDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  instanceIds: string[];

  @Type(() => RecipientDto)
  @ApiProperty({ type: () => RecipientDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  recipient?: IRecipient;

  @IsEnum(['customer', 'branch', 'buyer'])
  @IsString()
  @IsNotEmpty()
  @ValidateIf((e) => e.recipient === undefined)
  isFor: string;

  @IsString()
  @IsEnum(InvoiceTypes)
  @IsOptional()
  type?: string = 'official';
}
