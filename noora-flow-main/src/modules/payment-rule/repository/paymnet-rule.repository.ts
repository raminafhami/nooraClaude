import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  PaymentRule,
  PaymentRuleDocument,
} from '../schemas/payment-rule.schema';

@Injectable()
export class PaymentRuleRepositoryImpl extends BaseRepositoryImpl<PaymentRuleDocument> {
  constructor(
    @InjectModel(PaymentRule.name)
    protected paymentRuleModel: Model<PaymentRuleDocument>,
  ) {
    super(paymentRuleModel);
  }
}
