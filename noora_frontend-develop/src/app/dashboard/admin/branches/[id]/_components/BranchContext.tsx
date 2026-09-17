"use client";

import { createContext, useContext } from "react";

import { Branch } from "@/branches/models/Branch";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { LiaisonRelation } from "@/liaison-relations/models/LiaisonRelation";

export interface BranchContextType {
	branch: Branch;
	paymentRules: PaymentRule[];
	relations: LiaisonRelation[];
	onPaymentRulesUpdate: (rules: PaymentRule[]) => void;
	onRelationsUpdate: (relations: LiaisonRelation[]) => void;
}

export const BranchContext = createContext<BranchContextType>(
	{} as BranchContextType,
);

export function useBranchContext(): BranchContextType {
	return useContext(BranchContext);
}
