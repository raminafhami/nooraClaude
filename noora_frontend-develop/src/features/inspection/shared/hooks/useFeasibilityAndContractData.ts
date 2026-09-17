"use client";

import { useEffect, useState } from "react";

import { BuyerApi } from "@/buyers/models/BuyerApi";
import { getContractNumbers } from "@/contract-number/services/getContractNumbers";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { UserLookupApi } from "@/identity/users/models/UserLookup";
import { asNavigationProp } from "@/utils/asNavigationProp";

type Values = Partial<{
	buyer: BuyerApi;
	customer: UserLookupApi;
	proformaNo: string;
}>;

function useFeasibilityAndContractData(): {
	isLoading: boolean;
	values: Values;
} {
	const { task } = useTaskContext();

	const contractNo = task.instanceContractNo;
	const feasibilityInstanceId = task.data["FeasiblityInstanceId"];

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [values, setValues] = useState<Values>({});

	useEffect(() => {
		const queryFn = async () => {
			if (!contractNo && !feasibilityInstanceId) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);

				const contract = await getContractNumbers({
					filters: { cn: contractNo },
					populate: ["buyerId", "customerId"],
				}).then((contracts) => contracts.at(0));

				if (!contract) {
					throw new Error();
				}

				setValues({
					buyer: asNavigationProp(contract.buyerId),
					customer: asNavigationProp(contract.customerId),
					proformaNo: contract.proforma || undefined,
				});
			} catch {
			} finally {
				setIsLoading(false);
			}
		};

		queryFn();
	}, [contractNo, feasibilityInstanceId]);

	return { isLoading, values };
}

export { useFeasibilityAndContractData };
