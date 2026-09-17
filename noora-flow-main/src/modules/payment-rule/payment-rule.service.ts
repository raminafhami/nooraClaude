import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PaymentRuleDocument } from './schemas/payment-rule.schema';
import { PaymentRuleRepositoryImpl } from './repository/paymnet-rule.repository';

@Injectable()
export class PaymentRuleService extends CrudService<PaymentRuleDocument> {
  constructor(private paymentRuleRepositoryImpl: PaymentRuleRepositoryImpl) {
    super(paymentRuleRepositoryImpl);
  }
}
