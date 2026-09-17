import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";

import { PettyCostApi } from "../models/PettyCost";

type CreatePettyCostDto = {
	categoryId?: string;
	type: "official" | "unofficial";
	sellerNationalCode?: string | null;
	amount: string | number;
	currency?: Currency;
	currencyRate?: string | number;
	spentDate?: string;
	description: string;
	invoiceNumber?: string;
	hasVat?: boolean;
};

type CreatePettyCostApi = CreatePettyCostDto;

async function createPettyCost(
	details: CreatePettyCostDto,
): Promise<PettyCostApi> {
	const data: CreatePettyCostApi = {
		categoryId: details.categoryId || undefined,
		invoiceNumber: details.invoiceNumber || undefined,
		hasVat: details.hasVat,
		type: details.type,
		sellerNationalCode: details.sellerNationalCode || undefined,
		amount:
			typeof details.amount === "string"
				? parseFloat(details.amount)
				: details.amount,
		currency: details.currency ?? Currency.Rial,
		currencyRate:
			typeof details.currencyRate === "string"
				? parseInt(details.currencyRate)
				: (details.currencyRate ?? 1),
		spentDate: details.spentDate,
		description: details.description.trim(),
	};

	const response = await apiClient.post<any>({
		url: "petty-cost",
		body: data,
	});

	return response.result;
}

export { createPettyCost };
