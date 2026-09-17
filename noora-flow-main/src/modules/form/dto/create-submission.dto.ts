import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsObject({})
  data: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
