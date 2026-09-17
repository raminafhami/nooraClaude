import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class PersonnelExpertise {
  @IsNotEmpty()
  @IsString()
  expertiseId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  data: any;
}

export class PersonnelExpertiseListDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => PersonnelExpertise)
  items: PersonnelExpertise[];
}
