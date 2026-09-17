import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNo: string;
  @MinLength(4)
  @IsNotEmpty()
  password: string;
}
