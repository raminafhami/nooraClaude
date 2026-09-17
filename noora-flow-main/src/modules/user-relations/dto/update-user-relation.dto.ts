import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRelationDto } from './create-user-relation.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateUserRelationDto extends PartialType(
  OmitType(CreateUserRelationDto, ['userId']),
) {}
