import { Conditional } from "@/components/ui/conditional";
import { Dialog } from "@/components/ui/dialog";
import { Income } from "@/financial/incomes/models/Income";

import { IncomeUpsertForm } from "./IncomeUpsertForm";

function IncomeUpsertDialog({
	open,
	payload,
	onClose,
	onUnmount,
}: {
	open: boolean;
	payload: Partial<{
		income: Income | null | undefined;
		instanceId: string;
		force?: boolean;
	}>;
	onClose: (result?: boolean) => void;
	onUnmount?: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay onUnmount={onUnmount}>
				<IncomeUpsertForm onClose={onClose} {...payload} />
			</Conditional>
		</Dialog>
	);
}

export { IncomeUpsertDialog };
