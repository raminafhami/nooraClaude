import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  IsNumber,
  MaxLength,
  IsArray,
  IsDate,
} from 'class-validator';
import { ProjectType } from 'src/common/const/enums';

class ProjectTaskStatus {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  order: number;
}

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ApiProperty({ type: [ProjectTaskStatus], default: [] })
  // @ValidateType(() => StageDefinition)
  // @ValidateNested({ each: true })
  @Type(() => ProjectTaskStatus)
  statuses: ProjectTaskStatus[];

  @IsOptional()
  @IsArray()
  members?: [string];

  @ApiHideProperty()
  @IsOptional()
  @IsEnum(ProjectType)
  type?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsString()
  @ApiHideProperty()
  createdBy: string;
}

function ValidateType(arg0: () => typeof ProjectTaskStatus) {
  throw new Error('Function not implemented.');
}
