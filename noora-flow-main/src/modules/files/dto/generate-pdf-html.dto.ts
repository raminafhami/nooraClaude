import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DownloadTypes } from 'src/common/const/enums';

export class GeneratePdfHtmlDto {
  @ApiProperty()
  @IsNotEmpty()
  templateName: string;

  @ApiProperty()
  @IsNotEmpty()
  outputFileName: string;

  @ApiHideProperty()
  @IsOptional()
  templatePath?: string;

  @ApiProperty()
  @IsOptional()
  data?: any;

  @ApiProperty()
  @IsEnum(DownloadTypes)
  download: string;
}
