import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PaymentRuleMethod,
  PaymentRuleStatus,
  PaymentRuleType,
} from '../schemas/payment-rule.schema';

export class CreatePaymentRuleDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentRuleStatus)
  status: PaymentRuleStatus;

  @IsNotEmpty()
  @IsEnum(PaymentRuleType)
  type: PaymentRuleType;

  @IsNotEmpty()
  @IsEnum(PaymentRuleMethod)
  method: PaymentRuleMethod;

  @IsArray()
  cases: any[];

  @IsOptional()
  buyerId: string;
}
