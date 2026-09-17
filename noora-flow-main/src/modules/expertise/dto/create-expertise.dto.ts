import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ExpertiseType } from '../schemas/expertise.schema';

export class CreateExpertiseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(ExpertiseType)
  @IsString()
  type: ExpertiseType;
}
