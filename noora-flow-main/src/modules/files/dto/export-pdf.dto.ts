import { IsString } from 'class-validator';

export class ExportPdfFromKeyDto {
  @IsString()
  processInstanceId: string;

  @IsString()
  taskKeys: string;
}

export class ExportPdfFromVariablesDto {
  @IsString()
  processInstanceId: string;

  @IsString()
  variables: string;
}
