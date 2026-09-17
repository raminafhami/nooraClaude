import { parseBuyerLookup } from "@/buyers/utils/parseBuyerLookup";

import { PaymentRule, PaymentRuleApi } from "../models/PaymentRule";

export function parsePaymentRule(from: PaymentRuleApi): PaymentRule;
export function parsePaymentRule(from: PaymentRuleApi[]): PaymentRule[];
export function parsePaymentRule(
  from: PaymentRuleApi | PaymentRuleApi[]
): PaymentRule | PaymentRule[] {
  if (Array.isArray(from)) {
    return from.map((x) => parsePaymentRule(x));
  }

  const { buyer, ...fromRest } = from;

  let result: PaymentRule = {
    ...fromRest,
    buyer:
      from.buyer !== undefined
        ? from.buyer !== null
          ? parseBuyerLookup(from.buyer)
          : null
        : undefined,
  };

  return result;
}
