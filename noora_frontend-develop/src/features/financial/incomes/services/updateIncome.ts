import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";

import { IncomeUnit } from "../enums/IncomeUnit";

interface UpdateIncomeDto {
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	discount: number;
	description: string;
}

interface UpdateIncomeApi {
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	discount: number;
	description: string;
}

async function updateIncome(
	id: string,
	details: Partial<UpdateIncomeDto>,
): Promise<boolean> {
	const data: Partial<UpdateIncomeApi> = {};

	if (typeof details.amount !== "undefined") data.amount = details.amount;
	if (typeof details.currency !== "undefined") data.currency = details.currency;
	if (typeof details.currencyRate !== "undefined")
		data.currencyRate = details.currencyRate;
	if (typeof details.description !== "undefined")
		data.description = details.description.trim();
	if (typeof details.quantity !== "undefined") data.quantity = details.quantity;
	if (typeof details.unit !== "undefined") data.unit = details.unit;
	if (typeof details.discount !== "undefined") data.discount = details.discount;

	await apiClient.patch({
		url: `income/${id}`,
		body: data,
	});

	return true;
}

export { updateIncome };
