import { IsOptional } from 'class-validator';

export class InspectionFileDto {
  @IsOptional()
  category?: string;

  @IsOptional()
  description?: string;
}
