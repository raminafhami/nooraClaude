import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ChangeCourseParticipantDto {
  @IsNotEmpty()
  @IsIn(['+', '-'])
  mode = '+';

  @IsArray()
  @IsString({ each: true })
  users: string[];
}
