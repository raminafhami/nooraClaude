import { IsNumber, IsObject } from 'class-validator';

export class SaveResponseAnswersDto {
  @IsObject()
  answers: Record<string, unknown>;

  @IsNumber()
  revision: number;
}
