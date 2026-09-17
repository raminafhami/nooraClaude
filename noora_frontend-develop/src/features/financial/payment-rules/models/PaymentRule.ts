import { BuyerLookup, BuyerLookupApi } from "@/buyers/models/BuyerLookup";

import { PaymentRuleMethod } from "./PaymentRuleMethod";
import { PaymentRuleStatus } from "./PaymentRuleStatus";
import { PaymentRuleType } from "./PeymentRuleType";

export interface PaymentRule<TCase = any> {
  id: string;
  userId: string;
  service: string;
  name: string;
  buyerId: string | null;
  buyer?: BuyerLookup | null;
  type: PaymentRuleType;
  method: PaymentRuleMethod;
  amount: number;
  cases: TCase[];
  status: PaymentRuleStatus;
}

export interface PaymentRuleApi<TCase = any> {
  id: string;
  userId: string;
  service: string;
  name: string;
  buyerId: string | null;
  buyer?: BuyerLookupApi | null;
  type: PaymentRuleType;
  method: PaymentRuleMethod;
  amount: number;
  cases: TCase[];
  status: PaymentRuleStatus;
}
