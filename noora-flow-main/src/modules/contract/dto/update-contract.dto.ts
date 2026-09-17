import { PartialType } from '@nestjs/swagger';
import { CreateContractDto } from './create-contract.dto';
import { IsArray, IsOptional } from 'class-validator';
import { ContractApprover } from '../schemas/contract.schema';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @IsArray()
  @IsOptional()
  approvers?: ContractApprover[];
}
