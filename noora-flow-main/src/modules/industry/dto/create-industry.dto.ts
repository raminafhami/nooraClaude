import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { IndustryTypes } from 'src/common/const/enums';

export class CreateIndustryDto {
  @IsNotEmpty({ message: 'name is not given.' })
  name: string;

  @IsNotEmpty({ message: 'type is not given.' })
  @IsEnum(IndustryTypes, { message: 'type must be either "main" or "sub".' })
  type: string;

  @ValidateIf((o) => o.type === IndustryTypes.SUB)
  @IsNotEmpty({ message: 'parentId must be provided if type is "sub".' })
  @ValidateIf((o) => o.type === IndustryTypes.MAIN)
  @IsOptional() 
  parentId: string;
}
