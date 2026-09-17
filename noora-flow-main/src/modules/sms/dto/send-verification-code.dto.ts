import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsOptional()
  fullname?: string;
}
