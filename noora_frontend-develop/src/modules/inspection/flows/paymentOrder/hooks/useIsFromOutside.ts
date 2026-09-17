"use client";

import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";

import { ProcessType } from "../enums/ProcessType";

function useIsFromOutside({
	processType,
	pettyCostType,
}: {
	processType: ProcessType | undefined;
	pettyCostType: PettyCostType | null | undefined;
}): boolean {
	const isFromOutside =
		processType === ProcessType.Beneficiary ||
		!!(
			processType === ProcessType.PettyCash &&
			(typeof pettyCostType === "undefined" ||
				pettyCostType === PettyCostType.Official)
		);

	return isFromOutside;
}

export { useIsFromOutside };
