import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonnelRequestDto } from './create-personnel-request.dto';

export class UpdatePersonnelRequestDto extends PartialType(CreatePersonnelRequestDto) {}
