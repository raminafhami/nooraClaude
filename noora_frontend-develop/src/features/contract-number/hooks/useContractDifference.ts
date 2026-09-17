"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { ContractNumberDifference } from "@/contract-number/models/ContractNumberDifference";
import { getObjectKeys } from "@/utils/object/getObjectKeys";

import { findContractDifference } from "../services/findContractDifference";
import { getContractNumbers } from "../services/getContractNumbers";

const ContractNumberDifferenceDialog = dynamic(
	() =>
		import(
			"../components/contract-number-difference/ContractNumberDifferenceDialog"
		),
);

function useContractDifference(contractNo: string) {
	const dialogs = useDialogs();

	const verifyContractData = useCallback(
		async (data: ContractNumberDifference) => {
			const contract = await getContractNumbers({
				filters: { cn: contractNo },
				populate: ["buyerId", "customerId"],
			}).then((contracts) => contracts.at(0));

			const differences = await findContractDifference(contract, data);

			if (differences) {
				const result = await dialogs.open(ContractNumberDifferenceDialog, {
					contract: contract!,
					differences,
					data,
				});

				if (getObjectKeys(result).length) {
					const differenceFields = [
						result.buyer && "خریدار",
						result.customer && "مشتری",
						result.proforma && "شماره پروفرما",
					].filter(Boolean) as string[];

					const errorMessage = `فیلدهای ${differenceFields.join("، ")} با مقادیر متناظر در قرارداد مغایرت دارند.`;

					throw new Error(errorMessage);
				}
			}
		},
		[dialogs, contractNo],
	);

	return { verifyContractData };
}

export { useContractDifference };
