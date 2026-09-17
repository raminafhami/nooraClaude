import { IsOptional } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  download?: string = '1';

  @IsOptional()
  template?: string;
}

export class DocumentQueryDto {
  @IsOptional()
  fieldNames?: string;
}
