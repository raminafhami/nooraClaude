import { CreateCompanyFileDto } from './create-company-file.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateCompanyFileDto extends OmitType(CreateCompanyFileDto, [
  'file' as const,
]) {}
