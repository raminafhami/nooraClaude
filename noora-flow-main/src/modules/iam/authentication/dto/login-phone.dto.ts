import { IsNotEmpty, IsString } from 'class-validator';

export class LoginByPhoneDto {
  @IsString()
  @IsNotEmpty()
  phoneNo: string;
}
