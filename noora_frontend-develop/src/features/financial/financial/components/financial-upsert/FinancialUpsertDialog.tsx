import { Conditional } from "@/components/ui/conditional";
import { Dialog } from "@/components/ui/dialog";

import { FinancialType } from "../../enums/FinancialType";
import { Financial } from "../../models/Financial";
import { FinancialUpsertForm } from "./FinancialUpsertForm";

function FinancialUpsertDialog({
	open,
	payload,
	onClose,
}: {
	open: boolean;
	payload: {
		financial: Financial | null;
		financialType: FinancialType | undefined;
		instanceId: string;
		caseNo: string;
		force?: boolean;
	};
	onClose: (result?: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay>
				<FinancialUpsertForm {...payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

export { FinancialUpsertDialog };
