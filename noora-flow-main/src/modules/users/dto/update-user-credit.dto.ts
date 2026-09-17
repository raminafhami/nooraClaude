import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserCreditDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsNotEmpty()
  isFixed: boolean;
}
