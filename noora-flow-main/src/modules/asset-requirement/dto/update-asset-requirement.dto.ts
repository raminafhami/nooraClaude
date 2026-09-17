import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { CreateAssetRequirementDto } from './create-asset-requirement.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAssetRequirementDto extends PartialType(
  OmitType(CreateAssetRequirementDto, ['parent', 'auditId'] as const),
) {
  @IsOptional()
  @IsString()
  conflict: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdateAssetRequirementChildrenDto {
  @IsArray()
  @IsString({ each: true })
  children: string[];
}
