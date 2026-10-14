import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFormShareDto {
  @IsNotEmpty()
  @IsMongoId()
  recipientUserId: string;

  @IsOptional()
  @IsString()
  message?: string;
}
