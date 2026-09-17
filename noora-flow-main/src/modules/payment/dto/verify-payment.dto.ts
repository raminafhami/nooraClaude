import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import {
    TRANSACTION_TYPES,
} from '../schemas/payment.schema';

export class CreatePaymentRuleDto {
    @IsNotEmpty()
    @IsString()

    transActionType: string;

    @IsNotEmpty()
    @IsString()
    service: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsArray()
    @IsString({ each: true })
    cases: string[];
}
