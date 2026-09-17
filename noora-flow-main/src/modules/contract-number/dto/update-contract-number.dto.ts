import { PickType, PartialType } from '@nestjs/swagger';
import { CreateContractNumberDto } from './create-contract-number.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateContractNumberDto extends PartialType(
  PickType(CreateContractNumberDto, [
    'title',
    'customerId',
    'buyerId',
    'proforma',
  ] as const),
) {
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
