import apiClient from "@/api/client";

import { PaymentRule, PaymentRuleApi } from "../models/PaymentRule";
import { parsePaymentRule } from "../utils/parsePaymentRule";

interface PaymentRuleUpdateModel
  extends Partial<Omit<PaymentRule, "id" | "userId" | "service" | "buyer">> {}

interface PaymentRuleUpdateApiModel
  extends Partial<
    Omit<PaymentRuleApi, "id" | "userId" | "service" | "buyer">
  > {}

export async function updatePaymentRule(
  id: string,
  details: PaymentRuleUpdateModel,
): Promise<PaymentRule> {
  const data: PaymentRuleUpdateApiModel = {};
  const keys = Object.keys(details) as (keyof PaymentRuleUpdateModel)[];

  keys.includes("name") && (data.name = details.name);
  keys.includes("buyerId") && (data.buyerId = details.buyerId);
  keys.includes("type") && (data.type = details.type);
  keys.includes("method") && (data.method = details.method);
  keys.includes("amount") && (data.amount = details.amount);
  keys.includes("cases") && (data.cases = details.cases);
  keys.includes("status") && (data.status = details.status);

  const response = await apiClient.put<PaymentRuleApi>({
    url: `/payment-rule/${id}`,
    body: data,
  });

  return parsePaymentRule(response.result);
}
