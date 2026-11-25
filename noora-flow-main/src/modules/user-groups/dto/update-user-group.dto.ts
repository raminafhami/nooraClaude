import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateUserGroupDto } from './create-user-group.dto';
import { ArrayUnique, IsArray, IsMongoId, ValidateIf } from 'class-validator';

export class SetPermissionsDto {
  @IsArray({ message: 'permissions must be array' })
  @ArrayUnique()
  @IsMongoId({ each: true })
  permissions: string[];
}

export class CreateUserGroupWithPermissionsDto extends IntersectionType(
  CreateUserGroupDto,
  SetPermissionsDto,
) {}

export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  permissions?: string[];
}
