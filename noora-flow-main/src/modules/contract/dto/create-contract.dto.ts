import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContractApprover, ContractStatus } from '../schemas/contract.schema';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  contractNo: string;

  @IsNotEmpty()
  @IsString()
  damages: string;

  @IsNotEmpty()
  @IsDateString()
  signDate: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobs?: string[];

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  period: number;

  @IsNotEmpty()
  @IsString()
  salaryType: string;

  @IsNotEmpty()
  @IsString()
  workplace: string;

  @IsNotEmpty()
  @IsString()
  bankAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsOptional()
  bankBranch: string;

  @IsNotEmpty()
  @IsNumber()
  salaryAmount: number;

  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @IsOptional()
  @IsArray()
  approvers?: ContractApprover[];
}
