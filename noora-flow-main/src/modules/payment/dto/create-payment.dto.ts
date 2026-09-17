import { ApiProperty } from '@nestjs/swagger';
import { TRANSACTION_TYPES } from '../schemas/payment.schema';

export class CreatePaymentDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  amount: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: TRANSACTION_TYPES,
  })
  transActionType: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  paymentId: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  requestId: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  requestTimestamp: Date;
}
