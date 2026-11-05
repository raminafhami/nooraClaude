import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateSamplingPriceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  processKeys?: string[];

  // null brings a deprecated service back
  @IsOptional()
  @IsDateString()
  deprecatedFrom?: string | null;
}
