import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PopulateQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  populate: string;
}
