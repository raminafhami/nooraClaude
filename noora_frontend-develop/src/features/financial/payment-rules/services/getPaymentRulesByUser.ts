import { PaymentRule } from "../models/PaymentRule";
import { PaymentRuleBaseQuery } from "../models/PaymentRuleQuery";
import { getPaymentRules } from "./getPaymentRules";

export async function getPaymentRulesByUser(
  userId: string,
  options: Partial<PaymentRuleBaseQuery> = {}
): Promise<PaymentRule[]> {
  if (!options.filters) {
    options.filters = [];
  }

  options.filters.push({ name: "userId", value: userId });

  return await getPaymentRules(options);
}
