import apiClient from "@/api/client";

import { PaymentRule, PaymentRuleApi } from "../models/PaymentRule";
import { PaymentRuleStatus } from "../models/PaymentRuleStatus";
import { parsePaymentRule } from "../utils/parsePaymentRule";

interface PaymentRuleCreateModel
  extends Omit<PaymentRule, "id" | "buyer" | "status"> {}

interface PaymentRuleCreateApiModel
  extends Omit<PaymentRuleApi, "id" | "buyer"> {}

export async function createPaymentRule(
  details: PaymentRuleCreateModel,
): Promise<PaymentRule> {
  const data: PaymentRuleCreateApiModel = {
    status: PaymentRuleStatus.Active,
    ...details,
  };

  const response = await apiClient.post<PaymentRuleApi>({
    url: "/payment-rule",
    body: data,
  });

  return parsePaymentRule(response.result);
}
