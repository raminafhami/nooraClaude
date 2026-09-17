"use client";

import { useCallback, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";

import { useBranchContext } from "../BranchContext";
import { BranchPaymentRulesForm } from "./BranchPaymentRulesForm";
import { BranchPaymentRulesTable } from "./BranchPaymentRulesTable";

export function BranchPaymentRulesWidget(): React.ReactNode {
	const { branch } = useBranchContext();

	const [selectedRule, setSelectedRule] = useState<PaymentRule | null>(null);

	const handleRuleEdit = useCallback(
		(rule: PaymentRule | null) => setSelectedRule(rule),
		[],
	);

	const handleRuleUpdate = useCallback(
		(rule: PaymentRule) => {
			if (selectedRule && selectedRule.id === rule.id) {
				setSelectedRule(rule);
			}
		},
		[selectedRule],
	);

	return (
		<div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6">
			{branch.managerId ? (
				<>
					<div className="lg:col-span-1 xl:col-span-2 2xl:col-span-2">
						<div className="max-w-[25rem]">
							<BranchPaymentRulesForm
								rule={selectedRule}
								onRuleEditCancel={handleRuleEdit}
								onRuleUpdate={handleRuleUpdate}
							/>
						</div>
					</div>
					<div className="lg:col-span-full xl:col-span-full 2xl:col-span-4">
						<BranchPaymentRulesTable onRuleEdit={handleRuleEdit} />
					</div>
				</>
			) : (
				<div className="col-span-full">
					<DestructiveAlert className="w-fit">
						<AlertDescription>مدیر شعبه مشخص نشده است.</AlertDescription>
					</DestructiveAlert>
				</div>
			)}
		</div>
	);
}
