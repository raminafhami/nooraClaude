import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  isNotEmpty,
} from 'class-validator';
export class DegreeType {
  @ApiProperty()
  @IsOptional()
  level: string;

  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  field: string;
}
class Requirement {
  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [DegreeType] })
  @Type(() => DegreeType)
  degree: {
    level?: string;
    name?: string;
    field?: string;
  }[];

  @IsOptional()
  experience: {
    related?: string;
    unrelated?: string;
  };

  @IsArray()
  @IsString({ each: true })
  expertises: string[];

  @IsNotEmpty()
  @IsString()
  description: string;
}
export class CreateJobDescriptionDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  department?: string;

  @IsNotEmpty()
  @IsString()
  supervisor: string;

  @IsNotEmpty()
  @IsString()
  definition: string;

  @IsArray()
  @IsString({ each: true })
  duties: string[];

  @IsArray()
  @IsString({ each: true })
  authorities: string[];

  @ApiProperty({ type: Requirement })
  @Type(() => Requirement)
  @IsOptional()
  requirements: Requirement;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  metadata: object;
}
