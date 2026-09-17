import { Conditional } from "@/components/ui/conditional";
import { Dialog } from "@/components/ui/dialog";
import { Cost } from "@/financial/costs/models/Cost";

import { CostUpsertForm } from "./CostUpsertForm";

function CostUpsertDialog({
	open,
	payload,
	onClose,
	onUnmount,
}: {
	open: boolean;
	payload: {
		cost: Cost | null;
		instanceId: string;
		caseNo: string;
	};
	onClose: (result?: boolean) => void;
	onUnmount?: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay onUnmount={onUnmount}>
				<CostUpsertForm {...payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

export { CostUpsertDialog };
