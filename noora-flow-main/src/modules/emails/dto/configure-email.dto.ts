import { IsNotEmpty, IsString } from 'class-validator';

export class ConfigureEmailDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
