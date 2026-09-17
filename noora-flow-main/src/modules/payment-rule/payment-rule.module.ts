import { Module } from '@nestjs/common';
import { PaymentRuleService } from './payment-rule.service';
import { PaymentRuleController } from './payment-rule.controller';
import { PaymentRuleRepositoryImpl } from './repository/paymnet-rule.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentRule, PaymentRuleSchema } from './schemas/payment-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentRule.name, schema: PaymentRuleSchema },
    ]),
  ],
  controllers: [PaymentRuleController],
  providers: [PaymentRuleService, PaymentRuleRepositoryImpl],
})
export class PaymentRuleModule {}
