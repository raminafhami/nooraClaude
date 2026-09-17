import { ApiHideProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InstanceCaseTypes } from 'src/common/const/enums';

export class ChangeCaseTypeDto {
  @IsString()
  @IsEnum(InstanceCaseTypes)
  @IsNotEmpty()
  caseType: string;

  @IsString()
  @IsNotEmpty()
  instanceId: string;

  @IsOptional()
  @ApiHideProperty()
  updatedBy?: string;
}
