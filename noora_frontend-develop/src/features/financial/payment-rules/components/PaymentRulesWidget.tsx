"use client";

import { useCallback, useEffect, useState } from "react";

import { Loading } from "@/ui/Loader";

import { PaymentRule } from "../models/PaymentRule";
import { getPaymentRules } from "../services/getPaymentRules";
import { PaymentRuleCaseItemKey } from "./PaymentRuleCaseItem";
import PaymentRulesForm from "./PaymentRulesForm";
import PaymentRulesTable from "./PaymentRulesTable";

interface Props {
	userId: string;
	service: string;
	conditions: Partial<{ [key in PaymentRuleCaseItemKey]: boolean }>;
}

function PaymentRulesWidget({ userId, service, conditions }: Props) {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [rules, setRules] = useState<PaymentRule[] | null>(null);
	const [selectedRule, setSelectedRule] = useState<PaymentRule | null>(null);

	const handleRulesLoad = useCallback(async () => {
		try {
			setLoading(true);

			const rules = await getPaymentRules({
				filters: [
					{ name: "userId", value: userId },
					{ name: "service", value: service },
				],
				populate: ["buyer"],
				sort: { status: "asc" },
			});

			setRules(rules);
		} catch (err: any) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [service, userId]);

	const handleRuleAddOrUpdate = useCallback(
		(rule: PaymentRule) => {
			handleRulesLoad();
		},
		[handleRulesLoad],
	);

	const handleRuleEdit = useCallback(
		(rule: PaymentRule) => setSelectedRule(rule),
		[],
	);

	const handleRuleEditCancel = useCallback(() => {
		setSelectedRule(null);
	}, []);

	useEffect(() => {
		handleRulesLoad();
	}, [handleRulesLoad]);

	if (isLoading && !rules) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!rules) {
		return <></>;
	}

	return (
		<div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6">
			<div className="lg:col-span-1 xl:col-span-2 2xl:col-span-2">
				<div className="max-w-[25rem]">
					<PaymentRulesForm
						userId={userId}
						service={service}
						conditions={conditions}
						rule={selectedRule}
						onAdd={handleRuleAddOrUpdate}
						onEditCancel={handleRuleEditCancel}
						onUpdate={handleRuleAddOrUpdate}
					/>
				</div>
			</div>

			<div className="lg:col-span-full xl:col-span-full 2xl:col-span-4">
				<PaymentRulesTable
					loading={isLoading}
					rules={rules}
					conditions={conditions}
					onEdit={handleRuleEdit}
					onReload={handleRulesLoad}
					onUpdate={handleRuleAddOrUpdate}
				/>
			</div>
		</div>
	);
}

export default PaymentRulesWidget;
