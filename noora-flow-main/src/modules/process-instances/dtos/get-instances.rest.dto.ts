import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetQueryDto {
  @ApiProperty({
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    default: 10,
  })
  @IsNumber()
  @Type(() => Number)
  size: number;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  filters: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly dateFilters: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly sort: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly search: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  populate: any;

  @ApiProperty()
  @IsOptional()
  props?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  projection?: string | any;
}

export class PropDto {
  @ApiProperty()
  @IsOptional()
  props?: string;
}

export class GetQueryWithDownloadDto extends GetQueryDto {
  @ApiProperty()
  @IsOptional()
  download?: string;
}
