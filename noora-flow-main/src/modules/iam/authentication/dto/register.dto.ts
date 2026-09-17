import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Fill name' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Fill lastname' })
  @IsString()
  lastname: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  nationalCode: string;

  @MinLength(4, { message: 'Password is too short' })
  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phoneNo: string;
}
