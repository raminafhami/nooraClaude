import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

class File {
  @IsNotEmpty()
  @IsString()
  sourceFieldName: string;

  @IsNotEmpty()
  @IsString()
  destinationFieldName: string;

  @IsNotEmpty()
  @IsString()
  destinationFolder: string;
}

export class TransferFileDto {
  @IsNotEmpty()
  @IsString()
  sourceInstanceId: string;

  @IsNotEmpty()
  @IsString()
  destinationInstanceId: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => File)
  files: File[];
}
