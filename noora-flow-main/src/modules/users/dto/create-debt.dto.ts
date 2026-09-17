import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDebtDto {
  @IsString()
  @IsNotEmpty()
  instanceId: string;

  @IsArray()
  @IsNotEmpty()
  users: user[];

  @IsNumber()
  @IsOptional()
  @ApiHideProperty()
  amount?: number;

  @IsString()
  @IsOptional()
  @ApiHideProperty()
  caseNo?: string;
}

type user = {
  id: string;
  type: string;
};
