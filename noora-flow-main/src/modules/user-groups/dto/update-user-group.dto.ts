import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserGroupDto } from './create-user-group.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdateUserGroupDto extends PartialType(
  OmitType(CreateUserGroupDto, ['parentId'] as const),
) {}

export class SetPermissionsDto {
  @IsArray({ message: 'permissions must be array' })
  @IsString({ each: true })
  permissions: string[];
}
