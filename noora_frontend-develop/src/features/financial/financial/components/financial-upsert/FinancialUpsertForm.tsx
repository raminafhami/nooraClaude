import { useState } from "react";

import { CostUpsertForm } from "@/financial/costs/components/cost-upsert/CostUpsertForm";
import { IncomeUpsertForm } from "@/financial/incomes/components/income-upsert/IncomeUpsertForm";

import { FinancialType } from "../../enums/FinancialType";
import { Financial } from "../../models/Financial";

function FinancialUpsertForm({
	financial,
	financialType,
	instanceId,
	caseNo,
	force,
	onClose,
}: {
	financial: Financial | null;
	financialType: FinancialType | undefined;
	instanceId: string;
	caseNo: string;
	force?: boolean;
	onClose: (result?: boolean) => void;
}) {
	const [type] = useState<FinancialType | undefined>(financialType);

	if (!type) return;

	return type === FinancialType.Cost &&
		(!financial || financial.type === FinancialType.Cost) ? (
		<CostUpsertForm
			cost={financial?.item ?? null}
			instanceId={instanceId}
			caseNo={caseNo}
			onClose={onClose}
		/>
	) : (
		type === FinancialType.Income &&
			(!financial || financial.type === FinancialType.Income) && (
				<IncomeUpsertForm
					income={financial?.item ?? null}
					instanceId={instanceId}
					force={force}
					onClose={onClose}
				/>
			)
	);
}

export { FinancialUpsertForm };
