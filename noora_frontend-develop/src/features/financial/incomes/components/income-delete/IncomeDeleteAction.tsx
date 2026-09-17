"use client";

import { Slot } from "radix-ui";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";

import { Income } from "../../models/Income";
import { IncomeDeleteDialog } from "./IncomeDeleteDialog";

function IncomeDeleteAction({
	income: { id },
	...props
}: React.PropsWithChildren<{ income: Income }>) {
	const dialogs = useDialogs();

	async function handleClick() {
		await dialogs.open(IncomeDeleteDialog, id);
	}

	return <Slot.Root onClick={handleClick} {...props} />;
}

export { IncomeDeleteAction };
