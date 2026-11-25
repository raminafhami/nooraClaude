import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { USER_GROUP_TYPE } from '../schemas/user-group.schema';

export class CreateUserGroupDto {
  @IsString()
  @Length(2, 50, { message: 'Field length must be 50 characters.' })
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(USER_GROUP_TYPE)
  type: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string | null;

  @IsOptional()
  metadata?: any;
}
