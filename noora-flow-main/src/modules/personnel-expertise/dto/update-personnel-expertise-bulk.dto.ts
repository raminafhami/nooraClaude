import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePersonnelExpertise {
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  data: any;
}

export class UpdatePersonnelExpertiseListDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => UpdatePersonnelExpertise)
  items: UpdatePersonnelExpertise[];
}
