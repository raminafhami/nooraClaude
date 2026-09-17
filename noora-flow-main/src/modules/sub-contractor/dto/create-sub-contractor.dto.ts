import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubContractorDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reasonAssignment: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  evaluationDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  nextEvaluationDate: Date;
}
