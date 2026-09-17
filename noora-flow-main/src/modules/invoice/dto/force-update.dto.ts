import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { RecipientDto } from './recipient.dto';
import { ApiHideProperty } from '@nestjs/swagger';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';
export class ForceUpdateDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf(
    (o) =>
      o.financialDocumentId !== undefined && o.financialDocumentId !== null,
  )
  issueNo?: string;

  @IsDateString()
  @IsNotEmpty()
  @ValidateIf((o) => o.issue !== undefined && o.issueNo !== null)
  issuedAt?: string;

  @IsString()
  @IsOptional()
  financialDocumentId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1)
  items?: string[];

  @IsObject()
  @Type(() => RecipientDto)
  @ValidateNested()
  @IsOptional()
  recipient?: RecipientDto;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ApiHideProperty()
  @IsOptional()
  activeUser?: ActiveUserData;
}
