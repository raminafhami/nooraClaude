import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentRepositoryImpl extends BaseRepositoryImpl<PaymentDocument> {
  constructor(
    @InjectModel(Payment.name)
    protected paymentModel: Model<PaymentDocument>,
  ) {
    super(paymentModel);
  }
}
