import { asNavigationProp } from "@/utils/asNavigationProp";

import { ContractNumber } from "../models/ContractNumber";
import { ContractNumberDifference } from "../models/ContractNumberDifference";
import { getContractNumbers } from "./getContractNumbers";

async function findContractDifference(
	contractOrContractNo: ContractNumber | string | undefined,
	data: ContractNumberDifference,
): Promise<ContractNumberDifference | null> {
	let contract: ContractNumber | undefined;

	if (typeof contractOrContractNo === "object") {
		contract = contractOrContractNo;
	} else {
		contract = await getContractNumbers({
			filters: { cn: contractOrContractNo },
			populate: ["buyerId", "customerId"],
		}).then((contracts) => contracts.at(0));
	}

	if (!contract) {
		throw new Error("contract was not found.");
	}

	const result: ContractNumberDifference = {};

	const buyer = asNavigationProp(contract.buyerId);
	if (buyer && data.buyer && buyer.id !== data.buyer.id) {
		result.buyer = data.buyer;
	}

	const customer = asNavigationProp(contract.customerId);
	if (customer && data.customer && customer.id !== data.customer.id) {
		result.customer = data.customer;
	}

	if (
		contract.proforma &&
		data.proforma &&
		contract.proforma !== data.proforma
	) {
		result.proforma = data.proforma;
	}

	return Object.keys(result).length ? result : null;
}

export { findContractDifference };
