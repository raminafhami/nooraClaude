import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";

import { IncomeUnit } from "../enums/IncomeUnit";

interface ForceUpdateIncomeDto {
	categoryId: string;
	title: string;
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	description: string;
}

interface ForceUpdateIncomeApi {
	categoryId: string;
	title: string;
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	description: string;
}

async function forceUpdateIncome(
	id: string,
	details: Partial<ForceUpdateIncomeDto>,
): Promise<boolean> {
	const data: Partial<ForceUpdateIncomeApi> = {};

	if (typeof details.categoryId !== "undefined")
		data.categoryId = details.categoryId;
	if (typeof details.title !== "undefined") data.title = details.title;
	if (typeof details.amount !== "undefined") data.amount = details.amount;
	if (typeof details.currency !== "undefined") data.currency = details.currency;
	if (typeof details.currencyRate !== "undefined")
		data.currencyRate = details.currencyRate;
	if (typeof details.description !== "undefined")
		data.description = details.description.trim();
	if (typeof details.quantity !== "undefined") data.quantity = details.quantity;
	if (typeof details.unit !== "undefined") data.unit = details.unit;

	await apiClient.patch({
		url: `income/force-update/${id}`,
		body: data,
	});

	return true;
}

export { forceUpdateIncome };
