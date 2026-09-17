"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";

import { Branch } from "@/branches/models/Branch";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { LiaisonRelation } from "@/liaison-relations/models/LiaisonRelation";
import { Layout } from "@/ui/Layout";

import { BranchContext, BranchContextType } from "./BranchContext";
import { BranchManagerDocumentsWidget } from "./BranchDocuments/BranchManagerDocumentsWidget";
import { BranchNavigation } from "./BranchNavigation";
import { BranchPaymentRulesWidget } from "./BranchPaymentRules/BranchPaymentRulesWidget";
import { BranchRelationsWidget } from "./BranchRelations/BranchRelationsWidget";

export type BranchSection =
	| "information"
	| "paymentRules"
	| "relations"
	| "branchManagerDocuments";

interface Props {
	data: Branch;
}

export const BranchWidget = memo(function BranchWidget({
	data,
}: Props): React.ReactNode {
	const [branch, setBranch] = useState<Branch>(data);
	const [paymentRules, setPaymentRules] = useState<PaymentRule[]>([]);
	const [relations, setRelations] = useState<LiaisonRelation[]>([]);

	const [section, setSection] = useState<BranchSection | null>(null);

	const handleSectionChange = useCallback((s: BranchSection) => {
		setSection(s);
	}, []);

	const handleRelationsUpdate = useCallback((relations: LiaisonRelation[]) => {
		setRelations([...relations]);
	}, []);

	const handlePaymentRulesUpdate = useCallback((rules: PaymentRule[]) => {
		setPaymentRules([...rules]);
	}, []);

	const branchContextValue = useMemo(
		(): BranchContextType => ({
			branch,
			paymentRules,
			relations,
			onRelationsUpdate: handleRelationsUpdate,
			onPaymentRulesUpdate: handlePaymentRulesUpdate,
		}),
		[
			branch,
			paymentRules,
			relations,
			handlePaymentRulesUpdate,
			handleRelationsUpdate,
		],
	);

	return (
		<BranchContext.Provider value={branchContextValue}>
			<Layout.Root>
				<Layout.Head title={`شعبه ${branch.title}`}>
					<DynamicLink
						className="flex items-center px-3 py-1 text-black transition"
						href="/dashboard/admin"
					>
						<Button>
							<FaAngleRight className="text-2xs" />
							<span className="ms-1">بازگشت</span>
						</Button>
					</DynamicLink>
				</Layout.Head>
				<Layout.Content>
					<BranchNavigation section={section} onChange={handleSectionChange} />
					<BranchSection section={section} />
				</Layout.Content>
			</Layout.Root>
		</BranchContext.Provider>
	);
});

const BranchSection = memo(function BranchSection({
	section,
}: {
	section: BranchSection | null;
}): React.ReactNode {
	switch (section) {
		case "relations":
			return <BranchRelationsWidget />;
		case "paymentRules":
			return <BranchPaymentRulesWidget />;
		case "branchManagerDocuments":
			return <BranchManagerDocumentsWidget />;
		default:
			return <></>;
	}
});
