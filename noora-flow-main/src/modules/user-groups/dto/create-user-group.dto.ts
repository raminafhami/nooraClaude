import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
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
  @IsString()
  parentId?: string;

  @IsOptional()
  metadata?: any;
}
