import { IsArray, IsString } from 'class-validator';

export class CreateDispatcherCategoryDto {
  @IsString()
  domainCode: string;

  @IsString()
  inspectionDomain: string;

  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  include: string[];

  @IsArray()
  @IsString({ each: true })
  exclude: string[];
}

export class DispatcherCodesDto {
  @IsArray()
  @IsString({ each: true })
  codes: string[];
}
