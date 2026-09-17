import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class UserProperyDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
