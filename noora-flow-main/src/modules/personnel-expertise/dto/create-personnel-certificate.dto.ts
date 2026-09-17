import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UploadPersonnelCertificateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @IsNotEmpty()
  @IsDateString()
  certificateDate: Date;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class EditPersonnelCertificateDto extends PartialType(
  OmitType(UploadPersonnelCertificateDto, ['file'] as const),
) {}
