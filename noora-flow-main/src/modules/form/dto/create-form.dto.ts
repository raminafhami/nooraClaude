import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

class Question {
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  title: string;
}
export class CreateFormDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  certificateCode: string;

  @IsNotEmpty()
  @IsString()
  indicatorKey: string;

  @IsArray()
  @IsString({ each: true })
  groups: string[];

  @IsNotEmpty()
  @IsString()
  evaluator: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Question)
  questions: Question[];

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Max(99)
  @Min(1)
  startEvalNumber: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Max(99)
  @Min(1)
  endEvalNumber: number;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
