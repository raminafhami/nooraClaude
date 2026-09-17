import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuditDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  changeDescription?: string;

  @IsNotEmpty()
  @IsString()
  auditNo: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  reviewNumber: string;

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsBoolean()
  state = true;

  @IsNotEmpty()
  @IsString()
  producerId: string;

  @IsNotEmpty()
  @IsString()
  seconderId: string;

  @IsNotEmpty()
  @IsString()
  approverId: string;

  @IsOptional()
  @IsArray()
  users?: string[];

  @IsOptional()
  @IsArray()
  userGroups?: string[];
}
