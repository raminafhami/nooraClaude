import { CreateSubContractorDto } from './create-sub-contractor.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateSubContractorDto extends OmitType(CreateSubContractorDto, [
  'file',
] as const) {}
