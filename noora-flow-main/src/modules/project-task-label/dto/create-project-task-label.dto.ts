import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectTaskLabelDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
