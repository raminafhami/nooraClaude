import { PartialType } from '@nestjs/swagger';
import { CreatePersonnelExpertiseDto } from './create-personnel-expertise.dto';

export class UpdatePersonnelExpertiseDto extends PartialType(
  CreatePersonnelExpertiseDto,
) {}
